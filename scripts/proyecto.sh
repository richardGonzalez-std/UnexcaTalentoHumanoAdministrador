#!/usr/bin/env bash
# proyecto — alterna en pm2 entre los stacks de desarrollo de esta máquina.
#
#   grupo "erp"     → erp-backend (php artisan serve :8000)
#                     erp-frontend (pnpm dev / vite :5174)
#                     erp-queue (php artisan queue:work)
#   grupo "unexca"  → unexca-backend (gradlew bootRun, Spring Boot :8080)
#                     unexca-frontend (npm run dev, Next.js :3000)
#   grupo "studio"  → studio-backend (php artisan serve :8000)
#                     studio-frontend (pnpm dev, Next.js :3000)
#                     studio-queue (php artisan queue:work)
#
# Uso:
#   proyecto            # switch automático: rota erp → unexca → studio → erp
#   proyecto erp        # fuerza el stack erp2026
#   proyecto unexca     # fuerza el stack UnexcaTalentoHumano
#   proyecto studio     # fuerza el stack CR Studio
#   proyecto status     # qué está arriba y si los puertos responden
#   proyecto stop       # apaga todos los grupos
#   proyecto logs [g]   # pm2 logs del grupo (por defecto, el activo)
#
# Levantar un grupo *siempre* apaga los demás: es un switch, no un "start".
# Eso no es solo higiene: studio comparte el 8000 con erp y el 3000 con unexca,
# así que dos grupos a la vez se pisarían los puertos.

set -uo pipefail

# --- rutas ------------------------------------------------------------------
# readlink -f: el comando se invoca por un symlink en ~/.local/bin
SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
UNEXCA_DIR="${UNEXCA_DIR:-$(dirname "$SCRIPT_DIR")}"
ERP_DIR="${ERP_DIR:-/home/rrichard/trabajo/erp2026}"
STUDIO_DIR="${STUDIO_DIR:-/home/rrichard/trabajo/studio}"

PM2="$(command -v pm2 || true)"
[ -z "$PM2" ] && { echo "pm2 no está en el PATH" >&2; exit 1; }

# --- definición de los grupos ----------------------------------------------
# Para sumar un grupo nuevo: agregalo a GRUPOS, definí <GRUPO>_PROCS, sus
# puertos en PUERTO_DE y una función levantar_<grupo>. El resto del script
# (switch, rotación, status, logs) es genérico y no hay que tocarlo.
GRUPOS=(erp unexca studio)
GRUPO_DEFECTO=unexca            # el que se levanta cuando no hay nada online

ERP_PROCS=(erp-backend erp-frontend erp-queue)
UNEXCA_PROCS=(unexca-backend unexca-frontend)
STUDIO_PROCS=(studio-backend studio-frontend studio-queue)

# Puerto que expone cada proceso; los queue:work no escuchan nada y por eso
# no figuran acá. Ojo: hay puertos repetidos entre grupos (ver cabecera).
declare -A PUERTO_DE=(
  [erp-backend]=8000      [erp-frontend]=5174
  [unexca-backend]=8080   [unexca-frontend]=3000
  [studio-backend]=8000   [studio-frontend]=3000
)

# --- helpers ----------------------------------------------------------------
c_ok()   { printf '\033[32m%s\033[0m\n' "$*"; }
c_info() { printf '\033[36m%s\033[0m\n' "$*"; }
c_warn() { printf '\033[33m%s\033[0m\n' "$*"; }

procs_de() { # procs_de <grupo> → un proceso por línea
  local -n _procs="${1^^}_PROCS"
  printf '%s\n' "${_procs[@]}"
}

puertos_de() { # puertos_de <grupo> → un puerto por línea (sin repetir)
  local p pt
  declare -A _vistos=()
  for p in $(procs_de "$1"); do
    pt="${PUERTO_DE[$p]:-}"
    [ -z "$pt" ] && continue                  # los queue:work no escuchan nada
    [ -n "${_vistos[$pt]:-}" ] && continue
    _vistos[$pt]=1
    echo "$pt"
  done
  # return explícito: si no, el status queda en el del último test del bucle
  # (falso para los grupos que terminan en un queue) y con pipefail eso hacía
  # fallar a cualquiera que usara esta función como productor de un pipe
  return 0
}

usa_puerto() { # usa_puerto <grupo> <puerto>
  local pt
  for pt in $(puertos_de "$1"); do [ "$pt" = "$2" ] && return 0; done
  return 1
}

es_grupo() { # es_grupo <nombre>
  local g
  for g in "${GRUPOS[@]}"; do [ "$g" = "$1" ] && return 0; done
  return 1
}

existe() { "$PM2" describe "$1" >/dev/null 2>&1; }

online() { "$PM2" jlist 2>/dev/null | node -e '
  let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    const n=process.argv[1];
    const p=JSON.parse(s||"[]").find(x=>x.name===n);
    process.exit(p && p.pm2_env.status==="online" ? 0 : 1);
  });' "$1"; }

# grupo con al menos un proceso online
grupo_activo() {
  local g p
  for g in "${GRUPOS[@]}"; do
    for p in $(procs_de "$g"); do online "$p" && { echo "$g"; return; }; done
  done
  echo ninguno
}

# el siguiente en la rotación, para `proyecto` sin argumentos
grupo_siguiente() { # grupo_siguiente <grupo actual>
  local i
  for i in "${!GRUPOS[@]}"; do
    [ "${GRUPOS[$i]}" = "$1" ] && { echo "${GRUPOS[$(( (i + 1) % ${#GRUPOS[@]} ))]}"; return; }
  done
  echo "$GRUPO_DEFECTO"
}

# ¿el proceso ya registrado corre lo que queremos (ruta Y argumentos)?
# pm2 restart conserva la config con la que se creó, así que si cambió el
# repo de sitio, los args, o se creó mal una vez, hay que borrarlo y rehacerlo.
config_ok() { # config_ok <nombre> <cwd> <script> <args...>
  "$PM2" jlist 2>/dev/null | node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      const [n,cwd,script,...args]=process.argv.slice(1);
      const p=JSON.parse(s||"[]").find(x=>x.name===n);
      process.exit(p && p.pm2_env.pm_cwd===cwd && p.pm2_env.pm_exec_path===script
                     && JSON.stringify(p.pm2_env.args||[])===JSON.stringify(args) ? 0 : 1);
    });' "$@"
}

# ensure <nombre> <cwd> <script> <interprete> -- <args...>
ensure() {
  local name=$1 cwd=$2 script=$3 interp=$4; shift 4
  # el "--" de la firma es separador nuestro; si se lo dejamos a pm2 termina
  # llegando al programa (php -- artisan serve lee de stdin y no sirve nada)
  [ "${1:-}" = "--" ] && shift
  if existe "$name" && ! config_ok "$name" "$cwd" "$script" "$@"; then
    c_warn "  ! $name corría con otra config → lo recreo"
    "$PM2" delete "$name" >/dev/null 2>&1
  fi
  if existe "$name"; then
    "$PM2" restart "$name" --update-env >/dev/null && c_ok "  ↻ $name"
  else
    "$PM2" start "$script" --name "$name" --cwd "$cwd" --interpreter "$interp" \
      --time -- "$@" >/dev/null && c_ok "  + $name (creado)"
  fi
}

# mata lo que siga escuchando en un puerto tras el pm2 stop (bootRun deja
# JVMs huérfanas colgadas del daemon de Gradle, que no es hijo del proceso pm2)
liberar_puerto() {
  local port=$1 pids
  pids=$(ss -ltnp 2>/dev/null | grep -E "[:.]$port " | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
  [ -z "$pids" ] && return 0
  c_warn "  · puerto $port seguía ocupado → cerrando PID(s): $(echo "$pids" | tr '\n' ' ')"
  kill $pids 2>/dev/null
  sleep 2
  pids=$(ss -ltnp 2>/dev/null | grep -E "[:.]$port " | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
  [ -n "$pids" ] && kill -9 $pids 2>/dev/null
  return 0
}

apagar() { # apagar <grupo> [grupo a no pisar]
  local grupo=$1 protegido=${2:-} p pt algo=0
  for p in $(procs_de "$grupo"); do
    existe "$p" || continue
    "$PM2" stop "$p" >/dev/null 2>&1 && { c_info "  − $p detenido"; algo=1; }
  done
  [ $algo -eq 0 ] && return 0

  for pt in $(puertos_de "$grupo"); do
    # si el puerto también es del grupo que estamos por levantar, no lo tocamos:
    # el que escucha ahí sería un proceso del destino (studio comparte el 3000
    # con unexca y el 8000 con erp) y lo estaríamos matando de gusto
    if [ -n "$protegido" ] && usa_puerto "$protegido" "$pt"; then continue; fi
    liberar_puerto "$pt"
  done
  return 0
}

levantar_erp() {
  ensure erp-backend  "$ERP_DIR/back" /usr/bin/php none -- artisan serve --host=0.0.0.0 --port=8000
  ensure erp-queue    "$ERP_DIR/back" /usr/bin/php none -- artisan queue:work database --sleep=1 --tries=3 --timeout=120 --max-time=3600
  ensure erp-frontend "$ERP_DIR"      "$(command -v pnpm)" node -- run dev
}

levantar_unexca() {
  ensure unexca-backend  "$UNEXCA_DIR/back"  "$UNEXCA_DIR/back/gradlew" bash -- bootRun
  ensure unexca-frontend "$UNEXCA_DIR/front" "$(command -v npm)"        node -- run dev
}

levantar_studio() {
  # el front reescribe /api/* al backend (next.config.ts) y ese fallback está
  # fijo en 127.0.0.1:8000, así que el artisan serve tiene que ir al 8000.
  ensure studio-backend  "$STUDIO_DIR/backend" /usr/bin/php none -- artisan serve --host=0.0.0.0 --port=8000
  ensure studio-queue    "$STUDIO_DIR/backend" /usr/bin/php none -- artisan queue:work database --sleep=1 --tries=3 --timeout=120 --max-time=3600
  # --port explícito: si no, next dev salta solo al 3001 cuando encuentra el
  # 3000 tomado y el status de acá quedaría informando un puerto que no es.
  ensure studio-frontend "$STUDIO_DIR"         "$(command -v pnpm)" node -- run dev --port 3000
}

banner() { # banner <grupo> — qué quedó arriba y dónde
  case "$1" in
    erp)
      c_ok "Activo: erp2026 → http://localhost:5174 (front) · http://localhost:8000 (api)" ;;
    unexca)
      c_ok "Activo: UnexcaTalentoHumano → http://localhost:3000 (front) · http://localhost:8080 (api)"
      c_info "El backend Spring tarda ~30-60s en compilar antes de abrir el 8080 (proyecto logs)" ;;
    studio)
      c_ok "Activo: CR Studio → http://localhost:3000 (front) · http://localhost:8000 (api)"
      c_info "Next con turbopack tarda unos segundos en la primera compilación (proyecto logs)" ;;
  esac
}

switch_a() { # switch_a <grupo>
  local destino=$1 otro
  for otro in "${GRUPOS[@]}"; do
    [ "$otro" = "$destino" ] && continue
    c_info "→ apagando grupo '$otro'"
    apagar "$otro" "$destino"
  done

  c_info "→ levantando grupo '$destino'"
  "levantar_$destino"

  "$PM2" save --force >/dev/null 2>&1   # que un reboot resucite este grupo, no otro

  echo
  estado
  echo
  banner "$destino"
  c_info "Los puertos recién levantados tardan unos segundos en aparecer como 'escucha'."
}

puerto_escuchando() { ss -ltn 2>/dev/null | grep -qE "[:.]$1 "; }

estado() {
  printf '%-8s %-17s %-9s %s\n' GRUPO PROCESO ESTADO PUERTO
  local g p pt st detalle
  for g in "${GRUPOS[@]}"; do
    for p in $(procs_de "$g"); do
      pt="${PUERTO_DE[$p]:-}"
      existe "$p" && { online "$p" && st=online || st=stopped; } || st="sin crear"

      # el puerto se comparte entre grupos, así que "escucha" solo se afirma
      # del proceso que está online; si no lo está, lo tiene otro (o un huérfano)
      if [ -z "$pt" ]; then
        detalle="-"
      elif ! puerto_escuchando "$pt"; then
        detalle="$pt cerrado"
      elif [ "$st" = online ]; then
        detalle="$pt escucha"
      else
        detalle="$pt ocupado"
      fi

      printf '%-8s %-17s %-9s %s\n' "$g" "$p" "$st" "$detalle"
    done
  done
}

# --- main -------------------------------------------------------------------
case "${1:-auto}" in
  erp|laravel|erp2026)
    switch_a erp ;;
  unexca|talento|th)
    switch_a unexca ;;
  studio|crstudio|pep)
    switch_a studio ;;
  auto|toggle|switch)
    activo=$(grupo_activo)
    if [ "$activo" = ninguno ]; then
      c_info "Nada online → levanto '$GRUPO_DEFECTO'"
      switch_a "$GRUPO_DEFECTO"
    else
      destino=$(grupo_siguiente "$activo")
      c_info "Activo ahora: $activo → cambio a $destino"
      switch_a "$destino"
    fi ;;
  status|st)
    estado ;;
  stop|off)
    for g in "${GRUPOS[@]}"; do apagar "$g"; done; echo; estado ;;
  logs)
    grupo="${2:-$(grupo_activo)}"
    if es_grupo "$grupo"; then
      exec "$PM2" logs $(procs_de "$grupo") --lines 40
    else
      echo "No hay grupo activo; usá: proyecto logs $(IFS='|'; echo "${GRUPOS[*]}")" >&2; exit 1
    fi ;;
  -h|--help|help)
    # imprime el bloque de comentarios de la cabecera (todo lo que va del
    # shebang hasta la primera línea que ya no es comentario)
    awk 'NR>1 && /^#/ {sub(/^# ?/,""); print; next} NR>1 {exit}' \
      "$(readlink -f "${BASH_SOURCE[0]}")" ;;
  *)
    echo "Opción desconocida: $1 (probá: proyecto --help)" >&2; exit 1 ;;
esac
