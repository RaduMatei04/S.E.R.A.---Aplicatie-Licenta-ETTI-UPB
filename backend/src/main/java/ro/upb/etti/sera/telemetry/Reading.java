package ro.upb.etti.sera.telemetry;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * O citire a unei metrici la un moment dat. Tabelul este lung/ingust: metricile
 * globale au {@code plantId} null, cele per planta il au setat.
 */
@Entity
@Table(name = "reading")
public class Reading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ts", nullable = false)
    private Instant ts;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric", nullable = false)
    private MetricCode metric;

    @Enumerated(EnumType.STRING)
    @Column(name = "plant_id")
    private PlantId plantId;

    @Column(name = "value", nullable = false)
    private BigDecimal value;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload")
    private String payload;

    protected Reading() {
        // Hibernate
    }

    public Reading(Instant ts, MetricCode metric, PlantId plantId, BigDecimal value, String payload) {
        this.ts = ts;
        this.metric = metric;
        this.plantId = plantId;
        this.value = value;
        this.payload = payload;
    }

    public Long getId() {
        return id;
    }

    public Instant getTs() {
        return ts;
    }

    public MetricCode getMetric() {
        return metric;
    }

    public PlantId getPlantId() {
        return plantId;
    }

    public BigDecimal getValue() {
        return value;
    }

    public String getPayload() {
        return payload;
    }
}
