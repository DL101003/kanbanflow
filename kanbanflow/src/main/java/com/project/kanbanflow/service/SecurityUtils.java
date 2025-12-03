package com.project.kanbanflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecurityUtils {

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;

    @Value("${jwt.expiration:86400}")
    private long expiration;

    public String generateToken(String username, UUID userId) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("kanbanflow")
                .subject(username)
                .claim("userId", userId.toString())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiration))
                .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String extractUsername(String token) {
        Jwt jwt = decoder.decode(token);
        return jwt.getSubject();
    }

    public UUID extractUserId(String token) {
        Jwt jwt = decoder.decode(token);
        return UUID.fromString(jwt.getClaimAsString("userId"));
    }

    public boolean validateToken(String token) {
        try {
            decoder.decode(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}