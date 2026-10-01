package ro.upb.etti.sera.telemetry.dto;

/** Unitatile si etichetele, ca frontend-ul sa nu le hardcodeze. */
public record MetricCatalogResponse(
        String code,
        String unit,
        String labelRo,
        boolean perPlant,
        int sortOrder) {
}
