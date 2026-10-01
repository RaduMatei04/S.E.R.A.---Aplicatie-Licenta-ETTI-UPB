package ro.upb.etti.sera.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Reguli de consum al telemetriei.
 *
 * <p>Pragurile de sol duplica functia {@code soilLabel()} din
 * {@code sera-code/src/main.cpp}: device-ul calculeaza eticheta, dar nu o publica.
 * Daca pragurile se schimba in firmware, se schimba si aici.
 */
@ConfigurationProperties(prefix = "sera.ingest")
public record IngestProperties(
        Duration persistInterval,
        int soilDryBelow,
        int soilLowBelow,
        int soilOptimalBelow) {
}
