package ro.upb.etti.sera.telemetry;

import java.math.BigDecimal;
import java.time.Instant;

/** Proiectie pentru ultima citire a fiecarei combinatii metrica/planta. */
public interface LatestReading {

    String getMetric();

    String getPlantId();

    BigDecimal getValue();

    Instant getTs();
}
