package ro.upb.etti.sera.telemetry;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Catalogul de metrici tinut in memorie. Continutul este seed-uit de migrarea V1 si nu
 * se schimba la runtime, deci nu are rost sa fie citit din baza la fiecare mesaj MQTT
 * (care sosesc la 1 Hz).
 */
@Component
public class MetricCatalog {

    private final MetricRepository repository;
    private final Map<MetricCode, Metric> byCode = new EnumMap<>(MetricCode.class);

    MetricCatalog(MetricRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    void load() {
        repository.findAllByOrderBySortOrderAsc().forEach(metric -> byCode.put(metric.getCode(), metric));
    }

    public Metric get(MetricCode code) {
        return byCode.get(code);
    }

    public List<Metric> all() {
        return byCode.values().stream()
                .sorted(java.util.Comparator.comparingInt(Metric::getSortOrder))
                .toList();
    }
}
