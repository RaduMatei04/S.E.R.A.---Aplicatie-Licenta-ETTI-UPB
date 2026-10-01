package ro.upb.etti.sera.telemetry.dto;

/**
 * Starea unei plante. {@code soilState} este eticheta recalculata de backend dupa
 * pragurile din firmware, pentru ca device-ul o calculeaza dar nu o publica.
 */
public record PlantTelemetryResponse(
        String plantId,
        String label,
        boolean available,
        MetricValueResponse soilMoisture,
        String soilState) {
}
