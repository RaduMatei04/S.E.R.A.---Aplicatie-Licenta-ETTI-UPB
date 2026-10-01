package ro.upb.etti.sera.aggregate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import ro.upb.etti.sera.telemetry.MetricCode;
import ro.upb.etti.sera.telemetry.PlantId;

import java.math.BigDecimal;
import java.time.Instant;

/** Agregat pe ora, folosit de grafice pentru intervale lungi. */
@Entity
@Table(name = "reading_hourly")
public class ReadingHourly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bucket", nullable = false)
    private Instant bucket;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric", nullable = false)
    private MetricCode metric;

    @Enumerated(EnumType.STRING)
    @Column(name = "plant_id")
    private PlantId plantId;

    @Column(name = "min_value", nullable = false)
    private BigDecimal minValue;

    @Column(name = "avg_value", nullable = false)
    private BigDecimal avgValue;

    @Column(name = "max_value", nullable = false)
    private BigDecimal maxValue;

    @Column(name = "sample_count", nullable = false)
    private int sampleCount;

    protected ReadingHourly() {
        // Hibernate
    }

    public Instant getBucket() {
        return bucket;
    }

    public MetricCode getMetric() {
        return metric;
    }

    public PlantId getPlantId() {
        return plantId;
    }

    public BigDecimal getMinValue() {
        return minValue;
    }

    public BigDecimal getAvgValue() {
        return avgValue;
    }

    public BigDecimal getMaxValue() {
        return maxValue;
    }

    public int getSampleCount() {
        return sampleCount;
    }
}
