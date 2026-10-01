package ro.upb.etti.sera.telemetry;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * Catalogul de metrici: unitate, eticheta afisata si intervalul fizic valid.
 * Intervalul este limita senzorului, nu un prag de alerta - ce iese din el inseamna
 * citire gresita, nu conditie nepotrivita in sera.
 */
@Entity
@Table(name = "metric")
public class Metric {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "code", nullable = false)
    private MetricCode code;

    @Column(name = "unit", nullable = false)
    private String unit;

    @Column(name = "label_ro", nullable = false)
    private String labelRo;

    @Column(name = "per_plant", nullable = false)
    private boolean perPlant;

    @Column(name = "min_valid", nullable = false)
    private BigDecimal minValid;

    @Column(name = "max_valid", nullable = false)
    private BigDecimal maxValid;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected Metric() {
        // Hibernate
    }

    public MetricCode getCode() {
        return code;
    }

    public String getUnit() {
        return unit;
    }

    public String getLabelRo() {
        return labelRo;
    }

    public boolean isPerPlant() {
        return perPlant;
    }

    public BigDecimal getMinValid() {
        return minValid;
    }

    public BigDecimal getMaxValid() {
        return maxValid;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    /** Valoarea este plauzibila fizic pentru acest senzor. */
    public boolean isWithinValidRange(BigDecimal value) {
        return value.compareTo(minValid) >= 0 && value.compareTo(maxValid) <= 0;
    }
}
