package ro.upb.etti.sera.telemetry.dto;

import java.time.Instant;
import java.util.List;

public record SeriesResponse(
        String metric,
        String plantId,
        String unit,
        String labelRo,
        String bucket,
        Instant from,
        Instant to,
        List<SeriesPointResponse> points) {
}
