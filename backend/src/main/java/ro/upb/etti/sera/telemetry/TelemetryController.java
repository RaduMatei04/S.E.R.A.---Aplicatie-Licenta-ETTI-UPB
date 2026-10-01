package ro.upb.etti.sera.telemetry;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ro.upb.etti.sera.telemetry.dto.CurrentTelemetryResponse;
import ro.upb.etti.sera.telemetry.dto.MetricCatalogResponse;
import ro.upb.etti.sera.telemetry.dto.SeriesResponse;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
class TelemetryController {

    private static final Duration DEFAULT_WINDOW = Duration.ofHours(24);

    private final TelemetryService service;
    private final Clock clock;

    TelemetryController(TelemetryService service, Clock clock) {
        this.service = service;
        this.clock = clock;
    }

    @GetMapping("/telemetry/current")
    CurrentTelemetryResponse current() {
        return service.current();
    }

    @GetMapping("/telemetry/series")
    SeriesResponse series(
            @RequestParam MetricCode metric,
            @RequestParam(required = false) PlantId plantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "RAW") TelemetryService.Bucket bucket) {

        Instant end = to != null ? to : clock.instant();
        Instant start = from != null ? from : end.minus(DEFAULT_WINDOW);
        return service.series(metric, plantId, start, end, bucket);
    }

    @GetMapping("/metrics/catalog")
    List<MetricCatalogResponse> catalog() {
        return service.catalog();
    }
}
