package com.unexca.talentohumano.login;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    public record Claims(String cedula, long empleadoId) {}

    private final byte[] secret;
    private final long expMinutes;
    private final long expMinutesRecordarme;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.exp-minutes}") long expMinutes,
            @Value("${app.jwt.exp-minutes-recordarme}") long expMinutesRecordarme) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expMinutes = expMinutes;
        this.expMinutesRecordarme = expMinutesRecordarme;
    }

    /** Minutos de vida del token según "recordarme". Útil también para el Max-Age de la cookie. */
    public long expSegundos(boolean recordarme) {
        return (recordarme ? expMinutesRecordarme : expMinutes) * 60;
    }

    public String generar(String cedula, long empleadoId, boolean recordarme) {
        try {
            long now = new Date().getTime();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(cedula)
                    .claim("eid", empleadoId)
                    .issueTime(new Date(now))
                    .expirationTime(new Date(now + expSegundos(recordarme) * 1000))
                    .build();
            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            jwt.sign(new MACSigner(secret));
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("No se pudo firmar el JWT", e);
        }
    }

    public Optional<Claims> validar(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            if (!jwt.verify(new MACVerifier(secret))) return Optional.empty();
            JWTClaimsSet c = jwt.getJWTClaimsSet();
            if (c.getExpirationTime() == null || c.getExpirationTime().before(new Date())) {
                return Optional.empty();
            }
            return Optional.of(new Claims(c.getSubject(), c.getLongClaim("eid")));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
