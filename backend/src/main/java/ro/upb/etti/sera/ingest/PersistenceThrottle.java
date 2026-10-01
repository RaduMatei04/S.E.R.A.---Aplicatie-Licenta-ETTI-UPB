package ro.upb.etti.sera.ingest;

import org.springframework.stereotype.Component;
import ro.upb.etti.sera.config.IngestProperties;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Limiteaza ritmul de scriere in baza de date.
 *
 * <p>ESP32-ul publica la 1 Hz, adica ~518.000 de randuri pe zi pentru sase metrici.
 * Temperatura dintr-o sera nu se schimba semnificativ intr-o secunda, deci se persista
 * mai rar. Mesajele continua sa fie trimise pe WebSocket la fiecare receptie, deci
 * interfata ramane in timp real.
 */
@Component
class PersistenceThrottle {

    private final Duration interval;
    private final AtomicReference<Instant> lastPersisted = new AtomicReference<>();

    PersistenceThrottle(IngestProperties properties) {
        this.interval = properties.persistInterval();
    }

    /** True daca a trecut destul timp de la ultima scriere; marcheaza momentul. */
    boolean tryAcquire(Instant now) {
        Instant previous = lastPersisted.get();
        if (previous != null && Duration.between(previous, now).compareTo(interval) < 0) {
            return false;
        }
        return lastPersisted.compareAndSet(previous, now);
    }
}
