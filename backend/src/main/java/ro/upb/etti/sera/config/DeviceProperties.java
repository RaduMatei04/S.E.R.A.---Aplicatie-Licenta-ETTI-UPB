package ro.upb.etti.sera.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Pragurile dupa care device-ul este considerat offline. */
@ConfigurationProperties(prefix = "sera.device")
public record DeviceProperties(Duration offlineAfter, Duration watchdogInterval) {
}
