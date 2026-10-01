package ro.upb.etti.sera.telemetry;

/**
 * Metricile cunoscute. Valorile trebuie sa coincida cu coloana {@code code} din
 * tabelul {@code metric}, populat de migrarea V1.
 */
public enum MetricCode {
    TEMP_AIR,
    HUMIDITY_AIR,
    PRESSURE,
    LUX,
    SOIL_MOISTURE
}
