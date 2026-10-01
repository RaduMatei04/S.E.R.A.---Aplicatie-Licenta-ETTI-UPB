package ro.upb.etti.sera.events;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ro.upb.etti.sera.events.dto.EventPageResponse;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1/events")
class EventController {

    private static final Duration DEFAULT_WINDOW = Duration.ofDays(7);
    private static final int MAX_PAGE_SIZE = 200;

    private final EventService service;
    private final Clock clock;

    EventController(EventService service, Clock clock) {
        this.service = service;
        this.clock = clock;
    }

    @GetMapping
    EventPageResponse search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) EventType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {

        Instant end = to != null ? to : clock.instant();
        Instant start = from != null ? from : end.minus(DEFAULT_WINDOW);
        return service.search(start, end, type, Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
    }
}
