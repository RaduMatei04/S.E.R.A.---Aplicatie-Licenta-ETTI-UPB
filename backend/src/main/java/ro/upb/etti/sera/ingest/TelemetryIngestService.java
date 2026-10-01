package ro.upb.etti.sera.ingest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import ro.upb.etti.sera.device.DeviceStatusService;
import ro.upb.etti.sera.events.EventDetector;
import ro.upb.etti.sera.telemetry.Metric;
import ro.upb.etti.sera.telemetry.MetricCatalog;
import ro.upb.etti.sera.telemetry.MetricCode;
import ro.upb.etti.sera.telemetry.PlantId;
import ro.upb.etti.sera.telemetry.Sample;
import ro.upb.etti.sera.telemetry.TelemetrySnapshotFactory;
import ro.upb.etti.sera.ws.TelemetryBroadcaster;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Transforma un mesaj MQTT in citiri, evenimente si push catre frontend.
 */
@Service
public class TelemetryIngestService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryIngestService.class);

    private final ObjectMapper objectMapper;
    private final ReadingWriter readingWriter;
    private final MetricCatalog catalog;
    private final PersistenceThrottle throttle;
    private final EventDetector eventDetector;
    private final DeviceStatusService deviceStatusService;
    private final TelemetrySnapshotFactory snapshotFactory;
    private final TelemetryBroadcaster broadcaster;
    private final Clock clock;

    TelemetryIngestService(ObjectMapper objectMapper,
                           ReadingWriter readingWriter,
                           MetricCatalog catalog,
                           PersistenceThrottle throttle,
                           EventDetector eventDetector,
                           DeviceStatusService deviceStatusService,
                           TelemetrySnapshotFactory snapshotFactory,
                           TelemetryBroadcaster broadcaster,
                           Clock clock) {
        this.objectMapper = objectMapper;
        this.readingWriter = readingWriter;
        this.catalog = catalog;
        this.throttle = throttle;
        this.eventDetector = eventDetector;
        this.deviceStatusService = deviceStatusService;
        this.snapshotFactory = snapshotFactory;
        this.broadcaster = broadcaster;
        this.clock = clock;
    }

    /**
     * @param rawPayload textul JSON exact cum a venit de pe broker
     * @param retained   true daca brokerul a livrat un mesaj pastrat, nu unul proaspat
     */
    public void handle(String rawPayload, boolean retained) {
        if (retained) {
            // Pe `sera/senzori` exista un mesaj retained dintr-o versiune anterioara de
            // firmware, pe care brokerul il livreaza instant la fiecare abonare, chiar cu
            // ESP32-ul oprit. Fara acest filtru, fiecare pornire de backend ar inregistra
            // o valoare veche ca fiind proaspata.
            log.info("Mesaj retained ignorat la abonare: nu reprezinta o citire noua");
            return;
        }

        SensorPayload payload = parse(rawPayload);
        if (payload == null || payload.isEmpty()) {
            return;
        }

        Instant now = clock.instant();
        deviceStatusService.markSeen(now);

        List<Sample> samples = toSamples(payload, now);
        if (samples.isEmpty()) {
            return;
        }

        broadcaster.broadcastTelemetry(
                snapshotFactory.build(now, deviceStatusService.isOnline(), samples));

        samples.forEach(sample ->
                eventDetector.inspect(sample.ts(), sample.metric(), sample.plantId(), sample.value()));

        if (throttle.tryAcquire(now)) {
            readingWriter.write(samples, rawPayload);
        }
    }

    private SensorPayload parse(String rawPayload) {
        try {
            return objectMapper.readValue(rawPayload, SensorPayload.class);
        } catch (Exception exception) {
            log.warn("Payload MQTT invalid, ignorat: {}", exception.getMessage());
            return null;
        }
    }

    /**
     * Fiecare camp prezent devine o citire. Un camp absent nu produce rand - altfel un
     * senzor nefunctional ar lasa zerouri false in istoric.
     */
    private List<Sample> toSamples(SensorPayload payload, Instant ts) {
        List<Sample> samples = new ArrayList<>();
        addIfValid(samples, MetricCode.TEMP_AIR, null, payload.temp(), ts);
        addIfValid(samples, MetricCode.HUMIDITY_AIR, null, payload.umid(), ts);
        addIfValid(samples, MetricCode.PRESSURE, null, payload.presiune(), ts);
        addIfValid(samples, MetricCode.LUX, null, payload.lux(), ts);
        addIfValid(samples, MetricCode.SOIL_MOISTURE, PlantId.P1,
                payload.sol1() == null ? null : payload.sol1().doubleValue(), ts);
        addIfValid(samples, MetricCode.SOIL_MOISTURE, PlantId.P2,
                payload.sol2() == null ? null : payload.sol2().doubleValue(), ts);
        return samples;
    }

    private void addIfValid(List<Sample> samples, MetricCode code, PlantId plantId, Double raw, Instant ts) {
        if (raw == null || raw.isNaN() || raw.isInfinite()) {
            return;
        }
        Metric metric = catalog.get(code);
        if (metric == null) {
            return;
        }

        BigDecimal value = BigDecimal.valueOf(raw);
        if (!metric.isWithinValidRange(value)) {
            log.warn("Valoare in afara intervalului fizic pentru {}: {}", code, value);
            eventDetector.reportInvalidReading(ts, code, plantId, value);
            return;
        }
        samples.add(new Sample(code, plantId, value, ts));
    }
}
