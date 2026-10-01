package ro.upb.etti.sera.events.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record EventResponse(
        Long id,
        Instant ts,
        String type,
        String severity,
        String metric,
        String plantId,
        BigDecimal value,
        String message) {
}
