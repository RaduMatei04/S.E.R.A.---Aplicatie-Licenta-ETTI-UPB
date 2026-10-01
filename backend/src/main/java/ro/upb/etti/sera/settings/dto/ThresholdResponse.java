package ro.upb.etti.sera.settings.dto;

import java.math.BigDecimal;

public record ThresholdResponse(
        Long id,
        String metric,
        String plantId,
        String labelRo,
        String unit,
        BigDecimal minValue,
        BigDecimal maxValue,
        boolean enabled) {
}
