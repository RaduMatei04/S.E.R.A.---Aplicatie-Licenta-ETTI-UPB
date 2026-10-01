package ro.upb.etti.sera.telemetry;

import org.springframework.stereotype.Component;
import ro.upb.etti.sera.config.IngestProperties;

import java.math.BigDecimal;

/**
 * Eticheta de stare a solului.
 *
 * <p>Firmware-ul calculeaza aceasta eticheta in {@code soilLabel()}
 * ({@code sera-code/src/main.cpp}), dar publica pe MQTT doar procentul. Logica este deci
 * duplicata deliberat aici, cu pragurile aduse din configurare: daca se schimba in
 * firmware, se schimba si in {@code application.yml}.
 */
@Component
public class SoilStateResolver {

    private final IngestProperties properties;

    SoilStateResolver(IngestProperties properties) {
        this.properties = properties;
    }

    public String resolve(BigDecimal soilMoisturePercent) {
        if (soilMoisturePercent == null) {
            return null;
        }
        int percent = soilMoisturePercent.intValue();
        if (percent < properties.soilDryBelow()) {
            return "USCAT - uda planta";
        }
        if (percent < properties.soilLowBelow()) {
            return "Umiditate scazuta";
        }
        if (percent < properties.soilOptimalBelow()) {
            return "Optim";
        }
        return "Umed - nu mai uda";
    }
}
