package ro.upb.etti.sera.settings.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateSettingsRequest(
        @NotBlank(message = "Numele serei este obligatoriu")
        @Size(max = 120, message = "Numele serei poate avea cel mult 120 de caractere")
        String name,

        @Size(max = 500, message = "Descrierea poate avea cel mult 500 de caractere")
        String description,

        @Min(value = 1, message = "Intervalul de citire trebuie sa fie de cel putin o secunda")
        int readIntervalSecond,

        @Valid
        List<UpdateThresholdRequest> thresholds) {
}
