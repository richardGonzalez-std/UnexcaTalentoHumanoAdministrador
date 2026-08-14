---
description: Alterna en pm2 entre el stack erp2026 y el de este repo (back Spring + front Next)
argument-hint: "[erp|unexca|status|stop|logs] — sin argumento hace switch automático"
allowed-tools: Bash(proyecto:*)
---

Resultado de `proyecto $ARGUMENTS`:

!`proyecto $ARGUMENTS 2>&1`

Resumí en una línea qué stack quedó activo y en qué puertos. Si algún proceso quedó
`stopped` o `errored` cuando debería estar arriba, decilo y ofrecé revisar `proyecto logs`.
