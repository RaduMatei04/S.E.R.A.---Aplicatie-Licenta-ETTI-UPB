package ro.upb.etti.sera.telemetry.dto;

import java.time.Instant;
import java.util.List;

/** Tot ce afiseaza pagina Home intr-un singur raspuns. */
public record CurrentTelemetryResponse(
        Instant generatedAt,
        boolean deviceOnline,
        List<MetricValueResponse> greenhouse,
        List<PlantTelemetryResponse> plants) {
}
