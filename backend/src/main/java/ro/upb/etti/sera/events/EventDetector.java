package ro.upb.etti.sera.events;

import org.springframework.stereotype.Component;
import ro.upb.etti.sera.settings.SettingsService;
import ro.upb.etti.sera.settings.Threshold;
import ro.upb.etti.sera.telemetry.Metric;
import ro.upb.etti.sera.telemetry.MetricCatalog;
import ro.upb.etti.sera.telemetry.MetricCode;
import ro.upb.etti.sera.telemetry.PlantId;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Transforma citirile in evenimente de prag.
 *
 * <p>Device-ul publica la 1 Hz, deci o valoare care sta peste prag timp de un minut ar
 * genera 60 de evenimente identice. Detectorul tine minte ultima stare per
 * metrica/planta si scrie un eveniment doar la TRANZITIE - intrare sau iesire din
 * depasire.
 */
@Component
public class EventDetector {

    private final SettingsService settingsService;
    private final EventService eventService;
    private final MetricCatalog metricCatalog;
    private final Map<String, Breach> lastBreach = new ConcurrentHashMap<>();

    EventDetector(SettingsService settingsService, EventService eventService, MetricCatalog metricCatalog) {
        this.settingsService = settingsService;
        this.eventService = eventService;
        this.metricCatalog = metricCatalog;
    }

    public void inspect(Instant ts, MetricCode metric, PlantId plantId, BigDecimal value) {
        Threshold threshold = findThreshold(metric, plantId);
        if (threshold == null) {
            return;
        }

        Breach current = evaluate(threshold, value);
        Breach previous = lastBreach.put(key(metric, plantId), current);

        if (current == previous) {
            return;
        }
        if (current == Breach.NONE) {
            // Prima evaluare dupa pornire nu produce un mesaj de revenire din nimic.
            if (previous != null) {
                recordRecovery(ts, metric, plantId, value);
            }
            return;
        }
        recordBreach(ts, metric, plantId, value, current);
    }

    /** Valoarea respinsa de validare: in afara intervalului fizic al senzorului. */
    public void reportInvalidReading(Instant ts, MetricCode metric, PlantId plantId, BigDecimal value) {
        eventService.record(ts, EventType.INVALID_READING, Severity.WARNING, metric, plantId, value,
                "Citire ignorata: %s = %s este in afara intervalului fizic al senzorului"
                        .formatted(label(metric), value.toPlainString()));
    }

    private Breach evaluate(Threshold threshold, BigDecimal value) {
        if (threshold.isAbove(value)) {
            return Breach.HIGH;
        }
        if (threshold.isBelow(value)) {
            return Breach.LOW;
        }
        return Breach.NONE;
    }

    private void recordBreach(Instant ts, MetricCode metric, PlantId plantId, BigDecimal value, Breach breach) {
        EventType type = breach == Breach.HIGH ? EventType.THRESHOLD_HIGH : EventType.THRESHOLD_LOW;
        String direction = breach == Breach.HIGH ? "peste" : "sub";
        eventService.record(ts, type, Severity.WARNING, metric, plantId, value,
                "%s%s a trecut %s pragul configurat: %s %s"
                        .formatted(label(metric), plantSuffix(plantId), direction,
                                value.toPlainString(), unit(metric)));
    }

    private void recordRecovery(Instant ts, MetricCode metric, PlantId plantId, BigDecimal value) {
        eventService.record(ts, EventType.THRESHOLD_HIGH, Severity.INFO, metric, plantId, value,
                "%s%s a revenit in intervalul normal: %s %s"
                        .formatted(label(metric), plantSuffix(plantId), value.toPlainString(), unit(metric)));
    }

    private Threshold findThreshold(MetricCode metric, PlantId plantId) {
        List<Threshold> thresholds = settingsService.findEnabledThresholds();
        return thresholds.stream()
                .filter(threshold -> threshold.getMetric() == metric)
                .filter(threshold -> threshold.getPlantId() == plantId)
                .findFirst()
                .orElse(null);
    }

    private String label(MetricCode metric) {
        Metric entry = metricCatalog.get(metric);
        return entry == null ? metric.name() : entry.getLabelRo();
    }

    private String unit(MetricCode metric) {
        Metric entry = metricCatalog.get(metric);
        return entry == null ? "" : entry.getUnit();
    }

    private String plantSuffix(PlantId plantId) {
        return plantId == null ? "" : " (planta " + plantId.name() + ")";
    }

    private String key(MetricCode metric, PlantId plantId) {
        return metric.name() + ":" + (plantId == null ? "-" : plantId.name());
    }

    private enum Breach {
        NONE,
        LOW,
        HIGH
    }
}
