package ro.upb.etti.sera.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Cat timp se pastreaza citirile brute. Agregatele orare raman definitiv. */
@ConfigurationProperties(prefix = "sera.retention")
public record RetentionProperties(int rawDays) {
}
