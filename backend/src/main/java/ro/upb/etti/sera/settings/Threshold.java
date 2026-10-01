package ro.upb.etti.sera.settings;

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

/**
 * Prag de alerta pentru o metrica, optional per planta. Tabel separat de setari
 * pentru ca solul are praguri diferite pe fiecare planta si fiecare prag trebuie sa
 * poata fi dezactivat individual.
 */
@Entity
@Table(name = "threshold")
public class Threshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric", nullable = false)
    private MetricCode metric;

    @Enumerated(EnumType.STRING)
    @Column(name = "plant_id")
    private PlantId plantId;

    @Column(name = "min_value")
    private BigDecimal minValue;

    @Column(name = "max_value")
    private BigDecimal maxValue;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    protected Threshold() {
        // Hibernate
    }

    public Long getId() {
        return id;
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

    public BigDecimal getMaxValue() {
        return maxValue;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void update(BigDecimal minValue, BigDecimal maxValue, boolean enabled) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.enabled = enabled;
    }

    /** Valoarea depaseste limita de sus a pragului activ. */
    public boolean isAbove(BigDecimal value) {
        return enabled && maxValue != null && value.compareTo(maxValue) > 0;
    }

    /** Valoarea este sub limita de jos a pragului activ. */
    public boolean isBelow(BigDecimal value) {
        return enabled && minValue != null && value.compareTo(minValue) < 0;
    }
}
