package ro.upb.etti.sera.telemetry.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * O valoare curenta. {@code available} false inseamna ca nu exista nicio citire -
 * senzorul nu a raportat niciodata sau nu e montat. Valoarea este atunci null, nu zero.
 */
public record MetricValueResponse(
        String metric,
        String unit,
        String labelRo,
        BigDecimal value,
        Instant measuredAt,
        boolean available) {
}
