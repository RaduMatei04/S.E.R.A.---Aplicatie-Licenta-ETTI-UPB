package ro.upb.etti.sera.settings.dto;

import java.time.Instant;
import java.util.List;

public record SettingsResponse(
        String name,
        String description,
        int readIntervalSecond,
        Instant updatedAt,
        List<ThresholdResponse> thresholds) {
}
