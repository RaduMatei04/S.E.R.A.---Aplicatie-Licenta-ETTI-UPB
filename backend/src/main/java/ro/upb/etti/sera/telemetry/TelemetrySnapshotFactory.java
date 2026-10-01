package ro.upb.etti.sera.telemetry;

import org.springframework.stereotype.Component;
import ro.upb.etti.sera.telemetry.dto.CurrentTelemetryResponse;
import ro.upb.etti.sera.telemetry.dto.MetricValueResponse;
import ro.upb.etti.sera.telemetry.dto.PlantTelemetryResponse;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Construieste starea curenta afisata pe Home, din valori masurate.
 *
 * <p>Folosit atat de REST (cu ultimele valori din baza) cat si de ingest (cu valorile
 * tocmai primite pe MQTT), ca cele doua sa nu poata ajunge sa arate diferit.
 */
@Component
public class TelemetrySnapshotFactory {

    private final MetricCatalog catalog;
    private final SoilStateResolver soilStateResolver;

    TelemetrySnapshotFactory(MetricCatalog catalog, SoilStateResolver soilStateResolver) {
        this.catalog = catalog;
        this.soilStateResolver = soilStateResolver;
    }

    public CurrentTelemetryResponse build(Instant generatedAt, boolean deviceOnline, List<Sample> samples) {
        Map<String, Sample> byKey = samples.stream()
                .collect(Collectors.toMap(TelemetrySnapshotFactory::key, sample -> sample, (first, second) -> second));

        List<MetricValueResponse> greenhouse = catalog.all().stream()
                .filter(metric -> !metric.isPerPlant())
                .map(metric -> toValue(metric, byKey.get(key(metric.getCode(), null))))
                .toList();

        List<PlantTelemetryResponse> plants = Arrays.stream(PlantId.values())
                .map(plant -> toPlant(plant, byKey.get(key(MetricCode.SOIL_MOISTURE, plant))))
                .toList();

        return new CurrentTelemetryResponse(generatedAt, deviceOnline, greenhouse, plants);
    }

    private MetricValueResponse toValue(Metric metric, Sample sample) {
        return new MetricValueResponse(
                metric.getCode().name(),
                metric.getUnit(),
                metric.getLabelRo(),
                sample == null ? null : sample.value(),
                sample == null ? null : sample.ts(),
                sample != null);
    }

    private PlantTelemetryResponse toPlant(PlantId plant, Sample sample) {
        Metric soil = catalog.get(MetricCode.SOIL_MOISTURE);
        MetricValueResponse value = soil == null ? null : toValue(soil, sample);
        String state = sample == null ? null : soilStateResolver.resolve(sample.value());
        return new PlantTelemetryResponse(
                plant.name(),
                "Planta " + plant.name().substring(1),
                sample != null,
                value,
                state);
    }

    private static String key(Sample sample) {
        return key(sample.metric(), sample.plantId());
    }

    private static String key(MetricCode metric, PlantId plantId) {
        return metric.name() + ":" + Optional.ofNullable(plantId).map(PlantId::name).orElse("-");
    }
}
