package ro.upb.etti.sera.events;

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

/**
 * Intrare in jurnalul de evenimente. Toate evenimentele sunt derivate de backend din
 * telemetrie - device-ul nu publica evenimente.
 */
@Entity
@Table(name = "event")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ts", nullable = false)
    private Instant ts;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private EventType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric")
    private MetricCode metric;

    @Enumerated(EnumType.STRING)
    @Column(name = "plant_id")
    private PlantId plantId;

    @Column(name = "value")
    private BigDecimal value;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "source", nullable = false)
    private String source;

    protected Event() {
        // Hibernate
    }

    public Event(Instant ts, EventType type, Severity severity, MetricCode metric,
                 PlantId plantId, BigDecimal value, String message) {
        this.ts = ts;
        this.type = type;
        this.severity = severity;
        this.metric = metric;
        this.plantId = plantId;
        this.value = value;
        this.message = message;
        this.source = "BACKEND";
    }

    public Long getId() {
        return id;
    }

    public Instant getTs() {
        return ts;
    }

    public EventType getType() {
        return type;
    }

    public Severity getSeverity() {
        return severity;
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

    public String getMessage() {
        return message;
    }

    public String getSource() {
        return source;
    }
}
