package ro.upb.etti.sera.device;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import ro.upb.etti.sera.config.DeviceProperties;
import ro.upb.etti.sera.device.dto.DeviceStatusResponse;
import ro.upb.etti.sera.events.EventService;
import ro.upb.etti.sera.events.EventType;
import ro.upb.etti.sera.events.Severity;
import ro.upb.etti.sera.settings.SettingsService;
import ro.upb.etti.sera.telemetry.ReadingRepository;
import ro.upb.etti.sera.ws.TelemetryBroadcaster;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Starea device-ului, dedusa din traficul MQTT.
 *
 * <p>ESP32-ul nu anunta niciodata ca pleaca: in logul brokerului se vede ca pica pe
 * {@code exceeded timeout}. Singurul semnal disponibil este tacerea, deci starea se
 * deduce din momentul ultimului mesaj primit.
 */
@Service
public class DeviceStatusService {

    private static final Logger log = LoggerFactory.getLogger(DeviceStatusService.class);

    private final ReadingRepository readingRepository;
    private final SettingsService settingsService;
    private final EventService eventService;
    private final TelemetryBroadcaster broadcaster;
    private final DeviceProperties properties;
    private final Clock clock;

    private final AtomicReference<Instant> lastSeen = new AtomicReference<>();
    private final AtomicBoolean online = new AtomicBoolean(false);

    DeviceStatusService(ReadingRepository readingRepository,
                        SettingsService settingsService,
                        EventService eventService,
                        TelemetryBroadcaster broadcaster,
                        DeviceProperties properties,
                        Clock clock) {
        this.readingRepository = readingRepository;
        this.settingsService = settingsService;
        this.eventService = eventService;
        this.broadcaster = broadcaster;
        this.properties = properties;
        this.clock = clock;
    }

    /**
     * La pornire, "ultima vazuta" vine din baza de date: altfel un restart de backend ar
     * arata device-ul ca fiind offline de la inceputul timpului.
     */
    @PostConstruct
    void restoreLastSeen() {
        readingRepository.findLatestTimestamp().ifPresent(lastSeen::set);
    }

    /** Apelat la fiecare mesaj MQTT primit, inclusiv cele care nu se persista. */
    public void markSeen(Instant moment) {
        lastSeen.set(moment);
        if (online.compareAndSet(false, true)) {
            log.info("Device-ul a revenit online (ultimul mesaj la {})", moment);
            eventService.record(moment, EventType.DEVICE_ONLINE, Severity.INFO, null, null, null,
                    "Statia de senzori a revenit online");
            broadcaster.broadcastDeviceStatus(status());
        }
    }

    /** Verifica tacerea prelungita si marcheaza device-ul offline o singura data. */
    public void checkForSilence() {
        Instant seen = lastSeen.get();
        if (seen == null || !online.get()) {
            return;
        }
        Instant now = clock.instant();
        if (Duration.between(seen, now).compareTo(properties.offlineAfter()) <= 0) {
            return;
        }
        if (online.compareAndSet(true, false)) {
            log.info("Device-ul a trecut offline (fara mesaje din {})", seen);
            eventService.record(now, EventType.DEVICE_OFFLINE, Severity.CRITICAL, null, null, null,
                    "Statia de senzori nu a mai trimis date de peste %d secunde"
                            .formatted(properties.offlineAfter().toSeconds()));
            broadcaster.broadcastDeviceStatus(status());
        }
    }

    public boolean isOnline() {
        return online.get();
    }

    public DeviceStatusResponse status() {
        Instant seen = lastSeen.get();
        Long secondsSince = seen == null ? null : Duration.between(seen, clock.instant()).toSeconds();
        return new DeviceStatusResponse(
                online.get(),
                seen,
                secondsSince,
                settingsService.readIntervalSecond(),
                properties.offlineAfter().toSeconds());
    }
}
