package ro.upb.etti.sera.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Datele realm-ului Keycloak.
 *
 * <p>{@code issuerUri} si {@code jwkSetUri} difera intentionat: browserul vede Keycloak
 * la {@code localhost:8080} (deci asta ajunge in claim-ul {@code iss}), iar containerul
 * backend il vede la {@code keycloak-sera:8080} (deci de acolo descarca cheile publice).
 */
@ConfigurationProperties(prefix = "sera.keycloak")
public record KeycloakProperties(String issuerUri, String jwkSetUri, String audience) {
}
