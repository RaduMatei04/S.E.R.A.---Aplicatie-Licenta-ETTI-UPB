package ro.upb.etti.sera.events;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.upb.etti.sera.events.dto.EventPageResponse;
import ro.upb.etti.sera.events.dto.EventResponse;
import ro.upb.etti.sera.telemetry.MetricCode;
import ro.upb.etti.sera.telemetry.PlantId;
import ro.upb.etti.sera.ws.TelemetryBroadcaster;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class EventService {

    private final EventRepository repository;
    private final TelemetryBroadcaster broadcaster;

    EventService(EventRepository repository, TelemetryBroadcaster broadcaster) {
        this.repository = repository;
        this.broadcaster = broadcaster;
    }

    @Transactional(readOnly = true)
    public EventPageResponse search(Instant from, Instant to, EventType type, int page, int size) {
        Page<Event> result = repository.search(from, to, type, PageRequest.of(page, size));
        return new EventPageResponse(
                result.getContent().stream().map(EventService::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    /** Scrie evenimentul si il trimite imediat pe WebSocket. */
    @Transactional
    public EventResponse record(Instant ts, EventType type, Severity severity, MetricCode metric,
                                PlantId plantId, BigDecimal value, String message) {
        Event saved = repository.save(new Event(ts, type, severity, metric, plantId, value, message));
        EventResponse response = toResponse(saved);
        broadcaster.broadcastEvent(response);
        return response;
    }

    static EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTs(),
                event.getType().name(),
                event.getSeverity().name(),
                event.getMetric() == null ? null : event.getMetric().name(),
                event.getPlantId() == null ? null : event.getPlantId().name(),
                event.getValue(),
                event.getMessage());
    }
}
