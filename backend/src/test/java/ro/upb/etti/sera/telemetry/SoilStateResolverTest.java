package ro.upb.etti.sera.telemetry;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import ro.upb.etti.sera.config.IngestProperties;

import java.math.BigDecimal;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Etichetele trebuie sa coincida cu cele produse de {@code soilLabel()} din firmware,
 * inclusiv la limitele exacte ale pragurilor - acolo apar diferentele intre
 * {@code <} si {@code <=} cand logica e rescrisa in alt limbaj.
 */
class SoilStateResolverTest {

    private final SoilStateResolver resolver = new SoilStateResolver(
            new IngestProperties(Duration.ofSeconds(5), 20, 40, 70));

    @ParameterizedTest(name = "{0}% -> {1}")
    @CsvSource({
            "0,  USCAT - uda planta",
            "19, USCAT - uda planta",
            "20, Umiditate scazuta",
            "39, Umiditate scazuta",
            "40, Optim",
            "69, Optim",
            "70, Umed - nu mai uda",
            "100, Umed - nu mai uda"
    })
    void mapsPercentToFirmwareLabel(int percent, String expected) {
        assertThat(resolver.resolve(BigDecimal.valueOf(percent))).isEqualTo(expected);
    }

    @Test
    @DisplayName("fara valoare nu inventeaza o stare")
    void returnsNullWhenValueMissing() {
        assertThat(resolver.resolve(null)).isNull();
    }
}
