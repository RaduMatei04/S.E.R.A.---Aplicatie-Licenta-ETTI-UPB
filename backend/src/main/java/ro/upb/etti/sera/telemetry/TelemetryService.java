package ro.upb.etti.sera.telemetry;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.upb.etti.sera.aggregate.ReadingHourly;
import ro.upb.etti.sera.aggregate.ReadingHourlyRepository;
import ro.upb.etti.sera.common.InvalidRequestException;
import ro.upb.etti.sera.device.DeviceStatusService;
import ro.upb.etti.sera.telemetry.dto.CurrentTelemetryResponse;
import ro.upb.etti.sera.telemetry.dto.MetricCatalogResponse;
import ro.upb.etti.sera.telemetry.dto.SeriesPointResponse;
import ro.upb.etti.sera.telemetry.dto.SeriesResponse;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@Service
public class TelemetryService {

    private final ReadingRepository readingRepository;
    private final ReadingHourlyRepository hourlyRepository;
    private final TelemetrySnapshotFactory snapshotFactory;
    private final DeviceStatusService deviceStatusService;
    private final MetricCatalog catalog;
    private final Clock clock;

    TelemetryService(ReadingRepository readingRepository,
                     ReadingHourlyRepository hourlyRepository,
                     TelemetrySnapshotFactory snapshotFactory,
                     DeviceStatusService deviceStatusService,
                     MetricCatalog catalog,
                     Clock clock) {
        this.readingRepository = readingRepository;
        this.hourlyRepository = hourlyRepository;
        this.snapshotFactory = snapshotFactory;
        this.deviceStatusService = deviceStatusService;
        this.catalog = catalog;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public CurrentTelemetryResponse current() {
        List<Sample> samples = readingRepository.findLatestPerMetric().stream()
                .map(latest -> new Sample(
                        MetricCode.valueOf(latest.getMetric()),
                        latest.getPlantId() == null ? null : PlantId.valueOf(latest.getPlantId()),
                        latest.getValue(),
                        latest.getTs()))
                .toList();

        return snapshotFactory.build(clock.instant(), deviceStatusService.isOnline(), samples);
    }

    @Transactional(readOnly = true)
    public SeriesResponse series(MetricCode metricCode, PlantId plantId, Instant from, Instant to, Bucket bucket) {
        Metric metric = requireMetric(metricCode);
        requirePlantConsistency(metric, plantId);
        if (from.isAfter(to)) {
            throw new InvalidRequestException("Intervalul cerut are inceputul dupa sfarsit");
        }

        List<SeriesPointResponse> points = bucket == Bucket.HOUR
                ? hourlyPoints(metricCode, plantId, from, to)
                : rawPoints(metricCode, plantId, from, to);

        return new SeriesResponse(
                metric.getCode().name(),
                plantId == null ? null : plantId.name(),
                metric.getUnit(),
                metric.getLabelRo(),
                bucket.name().toLowerCase(),
                from,
                to,
                points);
    }

    @Transactional(readOnly = true)
    public List<MetricCatalogResponse> catalog() {
        return catalog.all().stream()
                .map(metric -> new MetricCatalogResponse(
                        metric.getCode().name(),
                        metric.getUnit(),
                        metric.getLabelRo(),
                        metric.isPerPlant(),
                        metric.getSortOrder()))
                .toList();
    }

    private List<SeriesPointResponse> rawPoints(MetricCode metric, PlantId plantId, Instant from, Instant to) {
        List<Reading> readings = plantId == null
                ? readingRepository.findByMetricAndPlantIdIsNullAndTsBetweenOrderByTsAsc(metric, from, to)
                : readingRepository.findByMetricAndPlantIdAndTsBetweenOrderByTsAsc(metric, plantId, from, to);

        return readings.stream()
                .map(reading -> new SeriesPointResponse(reading.getTs(), reading.getValue(), null, null))
                .toList();
    }

    private List<SeriesPointResponse> hourlyPoints(MetricCode metric, PlantId plantId, Instant from, Instant to) {
        List<ReadingHourly> buckets = plantId == null
                ? hourlyRepository.findByMetricAndPlantIdIsNullAndBucketBetweenOrderByBucketAsc(metric, from, to)
                : hourlyRepository.findByMetricAndPlantIdAndBucketBetweenOrderByBucketAsc(metric, plantId, from, to);

        return buckets.stream()
                .map(entry -> new SeriesPointResponse(
                        entry.getBucket(), entry.getAvgValue(), entry.getMinValue(), entry.getMaxValue()))
                .toList();
    }

    private Metric requireMetric(MetricCode code) {
        Metric metric = catalog.get(code);
        if (metric == null) {
            throw new InvalidRequestException("Metrica " + code + " nu exista in catalog");
        }
        return metric;
    }

    private void requirePlantConsistency(Metric metric, PlantId plantId) {
        if (metric.isPerPlant() && plantId == null) {
            throw new InvalidRequestException(
                    "Metrica " + metric.getCode() + " se masoara per planta, deci plantId este obligatoriu");
        }
        if (!metric.isPerPlant() && plantId != null) {
            throw new InvalidRequestException(
                    "Metrica " + metric.getCode() + " este la nivel de sera si nu accepta plantId");
        }
    }

    /** Rezolutia seriei returnate. */
    public enum Bucket {
        RAW,
        HOUR
    }
}
