package ro.upb.etti.sera.ingest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.event.EventListener;
import org.springframework.integration.mqtt.event.MqttConnectionFailedEvent;
import org.springframework.integration.mqtt.event.MqttSubscribedEvent;
import org.springframework.stereotype.Component;
import ro.upb.etti.sera.config.MqttProperties;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Expune starea conexiunii MQTT in {@code /actuator/health}.
 *
 * <p>Fara ea, un backend care si-a pierdut brokerul ar parea perfect sanatos: ar raspunde
 * la toate cererile REST, doar ca nu ar mai primi niciun fel de date. Asa, {@code docker
 * compose ps} il arata {@code unhealthy}.
 */
@Component("mqtt")
class MqttHealthIndicator implements HealthIndicator {

    private static final Logger log = LoggerFactory.getLogger(MqttHealthIndicator.class);

    private final MqttProperties properties;
    private final AtomicBoolean subscribed = new AtomicBoolean(false);
    private final AtomicReference<String> lastError = new AtomicReference<>();
    private final AtomicReference<Instant> changedAt = new AtomicReference<>();

    MqttHealthIndicator(MqttProperties properties) {
        this.properties = properties;
    }

    @EventListener
    void onSubscribed(MqttSubscribedEvent event) {
        if (subscribed.compareAndSet(false, true)) {
            log.info("Conectat la brokerul MQTT {} ({})", properties.url(), event.getMessage());
        }
        lastError.set(null);
        changedAt.set(Instant.now());
    }

    @EventListener
    void onConnectionFailed(MqttConnectionFailedEvent event) {
        if (subscribed.compareAndSet(true, false)) {
            log.info("Conexiunea MQTT catre {} s-a pierdut; se reincearca", properties.url());
        }
        lastError.set(event.getCause() == null ? "necunoscut" : event.getCause().getMessage());
        changedAt.set(Instant.now());
    }

    @Override
    public Health health() {
        Health.Builder builder = subscribed.get() ? Health.up() : Health.down();
        builder.withDetail("broker", properties.url())
                .withDetail("topic", properties.topic())
                .withDetail("clientId", properties.clientId());

        Instant since = changedAt.get();
        if (since != null) {
            builder.withDetail("since", since.toString());
        }
        String error = lastError.get();
        if (error != null) {
            builder.withDetail("lastError", error);
        }
        return builder.build();
    }
}
