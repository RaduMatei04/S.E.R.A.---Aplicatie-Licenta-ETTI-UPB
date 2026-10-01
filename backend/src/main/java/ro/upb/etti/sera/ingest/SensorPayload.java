package ro.upb.etti.sera.ingest;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Mesajul publicat de ESP32 pe topicul {@code sera/senzori}.
 *
 * <p>Formatul este cel real, din {@code publishReadings()} in
 * {@code sera-code/src/main.cpp}:
 * <pre>{@code
 * {"temp":27.21,"umid":28.38,"presiune":1003.62,"lux":12.5,"sol1":100,"sol2":100}
 * }</pre>
 *
 * <p>Toate campurile sunt nullable intentionat: firmware-ul adauga valorile BME280 si
 * BH1750 doar daca senzorul a fost gasit la pornire, deci un senzor lipsa inseamna camp
 * absent, nu valoare zero. Nu exista timestamp si nici identificator de device in mesaj.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SensorPayload(
        Double temp,
        Double umid,
        Double presiune,
        Double lux,
        Integer sol1,
        Integer sol2) {

    boolean isEmpty() {
        return temp == null && umid == null && presiune == null
                && lux == null && sol1 == null && sol2 == null;
    }
}
