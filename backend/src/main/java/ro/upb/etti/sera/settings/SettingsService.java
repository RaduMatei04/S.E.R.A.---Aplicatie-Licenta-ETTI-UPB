package ro.upb.etti.sera.settings;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.upb.etti.sera.common.InvalidRequestException;
import ro.upb.etti.sera.common.NotFoundException;
import ro.upb.etti.sera.settings.dto.SettingsResponse;
import ro.upb.etti.sera.settings.dto.ThresholdResponse;
import ro.upb.etti.sera.settings.dto.UpdateSettingsRequest;
import ro.upb.etti.sera.settings.dto.UpdateThresholdRequest;
import ro.upb.etti.sera.telemetry.Metric;
import ro.upb.etti.sera.telemetry.MetricCode;
import ro.upb.etti.sera.telemetry.MetricRepository;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class SettingsService {

    private final GreenhouseSettingsRepository settingsRepository;
    private final ThresholdRepository thresholdRepository;
    private final MetricRepository metricRepository;
    private final Clock clock;

    /**
     * Pragurile sunt consultate la fiecare mesaj MQTT, adica de sase ori pe secunda.
     * Se schimba doar prin PUT /settings, deci se tin in memorie si se invalideaza la
     * scriere, in loc sa fie recitite din baza la fiecare citire de senzor.
     */
    private volatile List<Threshold> enabledThresholdCache;

    SettingsService(GreenhouseSettingsRepository settingsRepository,
                    ThresholdRepository thresholdRepository,
                    MetricRepository metricRepository,
                    Clock clock) {
        this.settingsRepository = settingsRepository;
        this.thresholdRepository = thresholdRepository;
        this.metricRepository = metricRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public SettingsResponse find() {
        return toResponse(loadSettings());
    }

    @Transactional
    public SettingsResponse update(UpdateSettingsRequest request) {
        GreenhouseSettings settings = loadSettings();
        settings.update(request.name(), request.description(), request.readIntervalSecond(),
                clock.instant());

        if (request.thresholds() != null) {
            request.thresholds().forEach(this::applyThreshold);
        }
        enabledThresholdCache = null;
        return toResponse(settings);
    }

    /** Pragurile active, folosite de detectorul de evenimente. */
    @Transactional(readOnly = true)
    public List<Threshold> findEnabledThresholds() {
        List<Threshold> cached = enabledThresholdCache;
        if (cached != null) {
            return cached;
        }
        List<Threshold> loaded = thresholdRepository.findAllByOrderByMetricAscPlantIdAsc().stream()
                .filter(Threshold::isEnabled)
                .toList();
        enabledThresholdCache = loaded;
        return loaded;
    }

    @Transactional(readOnly = true)
    public int readIntervalSecond() {
        return loadSettings().getReadIntervalSecond();
    }

    private void applyThreshold(UpdateThresholdRequest request) {
        Threshold threshold = thresholdRepository.findById(request.id())
                .orElseThrow(() -> new NotFoundException(
                        "Pragul cu identificatorul " + request.id() + " nu exista"));

        if (request.minValue() != null && request.maxValue() != null
                && request.minValue().compareTo(request.maxValue()) >= 0) {
            throw new InvalidRequestException(
                    "Pentru " + threshold.getMetric() + ", valoarea minima trebuie sa fie mai mica decat cea maxima");
        }
        if (request.minValue() == null && request.maxValue() == null) {
            throw new InvalidRequestException(
                    "Pentru " + threshold.getMetric() + " trebuie setata cel putin o limita");
        }
        threshold.update(request.minValue(), request.maxValue(), request.enabled());
    }

    private GreenhouseSettings loadSettings() {
        return settingsRepository.findById(GreenhouseSettings.SINGLETON_ID)
                .orElseThrow(() -> new NotFoundException("Configurarea serei nu a fost initializata"));
    }

    private SettingsResponse toResponse(GreenhouseSettings settings) {
        Map<MetricCode, Metric> metrics = metricRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Metric::getCode, Function.identity()));

        List<ThresholdResponse> thresholds = thresholdRepository.findAllByOrderByMetricAscPlantIdAsc().stream()
                .map(threshold -> toResponse(threshold, metrics.get(threshold.getMetric())))
                .toList();

        return new SettingsResponse(settings.getName(), settings.getDescription(),
                settings.getReadIntervalSecond(), settings.getUpdatedAt(), thresholds);
    }

    private ThresholdResponse toResponse(Threshold threshold, Metric metric) {
        BigDecimal min = threshold.getMinValue();
        BigDecimal max = threshold.getMaxValue();
        return new ThresholdResponse(
                threshold.getId(),
                threshold.getMetric().name(),
                threshold.getPlantId() == null ? null : threshold.getPlantId().name(),
                metric == null ? threshold.getMetric().name() : metric.getLabelRo(),
                metric == null ? "" : metric.getUnit(),
                min,
                max,
                threshold.isEnabled());
    }
}
