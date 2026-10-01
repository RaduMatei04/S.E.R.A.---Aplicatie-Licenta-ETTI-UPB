package ro.upb.etti.sera.common;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Ceasul este injectat, nu citit prin {@code Instant.now()} imprastiat prin cod:
 * altfel logica dependenta de timp (throttling, watchdog) nu poate fi testata.
 */
@Configuration
class ClockConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
