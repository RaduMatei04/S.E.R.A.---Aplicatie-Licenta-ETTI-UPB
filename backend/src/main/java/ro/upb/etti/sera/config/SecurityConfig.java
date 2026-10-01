package ro.upb.etti.sera.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Backend-ul este resource server OAuth2: valideaza local semnatura JWT-ului emis de
 * Keycloak, folosind cheile publice ale realm-ului. Nu tine sesiuni, nu vede parole si
 * nu interogheaza Keycloak la fiecare cerere.
 */
@Configuration
class SecurityConfig {

    private final CorsProperties corsProperties;
    private final KeycloakProperties keycloakProperties;

    SecurityConfig(CorsProperties corsProperties, KeycloakProperties keycloakProperties) {
        this.corsProperties = corsProperties;
        this.keycloakProperties = keycloakProperties;
    }

    /**
     * Decodor cu validare de audienta.
     *
     * <p>Implicit, Spring verifica doar emitentul si valabilitatea in timp. Fara
     * verificarea `aud`, orice token valid emis de realm - inclusiv unul destinat altei
     * aplicatii - ar fi acceptat aici. Audienta este pusa in token de mapper-ul
     * `sera-backend-audience` din frontend/keycloak/realm-sera.json.
     */
    @Bean
    JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri(keycloakProperties.jwkSetUri())
                .build();
        decoder.setJwtValidator(new org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(keycloakProperties.issuerUri()),
                audienceValidator()));
        return decoder;
    }

    private OAuth2TokenValidator<Jwt> audienceValidator() {
        String expected = keycloakProperties.audience();
        return jwt -> jwt.getAudience() != null && jwt.getAudience().contains(expected)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new org.springframework.security.oauth2.core.OAuth2Error(
                        "invalid_token",
                        "Token-ul nu este destinat aplicatiei " + expected,
                        null));
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // API fara stare, apelat cu token Bearer: CSRF nu se aplica.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Handshake-ul WebSocket nu poate purta antetul Authorization;
                        // token-ul se verifica la CONNECT, in StompAuthInterceptor.
                        .requestMatchers("/ws/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsProperties.allowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "PUT", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/ws/**", configuration);
        return source;
    }
}
