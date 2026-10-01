package ro.upb.etti.sera.telemetry;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * O valoare masurata, independenta de sursa: poate veni dintr-un mesaj MQTT tocmai
 * primit sau din ultima citire salvata in baza. Permite ca raspunsul REST si mesajul
 * de pe WebSocket sa fie construite de acelasi cod.
 */
public record Sample(MetricCode metric, PlantId plantId, BigDecimal value, Instant ts) {
}
