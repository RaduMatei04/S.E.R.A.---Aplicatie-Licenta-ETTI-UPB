package ro.upb.etti.sera.settings.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateThresholdRequest(
        @NotNull(message = "Pragul trebuie sa aiba un identificator")
        Long id,
        BigDecimal minValue,
        BigDecimal maxValue,
        boolean enabled) {
}
