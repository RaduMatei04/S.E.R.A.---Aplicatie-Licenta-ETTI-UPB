package ro.upb.etti.sera.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Originile din care frontend-ul are voie sa apeleze API-ul. */
@ConfigurationProperties(prefix = "sera.cors")
public record CorsProperties(List<String> allowedOrigins) {
}
