package ro.upb.etti.sera.telemetry.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Un punct de grafic. Pentru bucket-ul orar, {@code minValue} si {@code maxValue}
 * descriu variatia din interval; pentru citirile brute sunt null.
 */
public record SeriesPointResponse(
        Instant ts,
        BigDecimal value,
        BigDecimal minValue,
        BigDecimal maxValue) {
}
