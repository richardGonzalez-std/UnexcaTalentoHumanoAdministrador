package com.unexca.talentohumano.login;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Construye la cookie httpOnly que transporta el JWT.
 *
 * Centraliza los atributos porque la cookie de login y la de logout deben coincidir
 * en nombre, path, secure y sameSite: si difieren en algo, el navegador las trata
 * como cookies distintas y el logout no cierra la sesión.
 *
 * Los atributos son configurables porque dependen de dónde esté desplegado el front:
 * - Local (front y back en localhost): SameSite=Lax, sin Secure. Es el default.
 * - Producción (front en Vercel, back en Render): son dominios distintos, la cookie
 *   viaja cross-site y el navegador exige SameSite=None junto con Secure.
 */
@Component
public class TokenCookieFactory {

    /** Nombre de la cookie. Lo lee también {@link JwtCookieFilter}. */
    public static final String NOMBRE = "token";

    private final boolean secure;
    private final String sameSite;

    public TokenCookieFactory(@Value("${app.cookie.secure}") boolean secure,
                              @Value("${app.cookie.same-site}") String sameSite) {
        this.secure = secure;
        this.sameSite = sameSite;
    }

    /**
     * El navegador descarta en silencio toda cookie SameSite=None que no sea Secure:
     * el login respondería 200 y el usuario quedaría igual de deslogueado, sin ningún
     * error visible. Preferimos no arrancar antes que depurar eso en producción.
     */
    @PostConstruct
    void validarCombinacion() {
        if ("None".equalsIgnoreCase(sameSite) && !secure) {
            throw new IllegalStateException(
                    "app.cookie.same-site=None exige app.cookie.secure=true; el navegador "
                    + "descarta la cookie si no. Revisá las variables COOKIE_SAME_SITE y COOKIE_SECURE.");
        }
    }

    /** Cookie de sesión con el JWT. maxAgeSegundos negativo = dura hasta cerrar el navegador. */
    public ResponseCookie crear(String token, long maxAgeSegundos) {
        return atributos(ResponseCookie.from(NOMBRE, token)).maxAge(maxAgeSegundos).build();
    }

    /** Cookie vacía y ya expirada, para cerrar sesión. */
    public ResponseCookie borrar() {
        return atributos(ResponseCookie.from(NOMBRE, "")).maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder atributos(ResponseCookie.ResponseCookieBuilder b) {
        return b.httpOnly(true).secure(secure).sameSite(sameSite).path("/");
    }
}
