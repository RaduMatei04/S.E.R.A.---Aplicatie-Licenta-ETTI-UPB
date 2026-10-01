package ro.upb.etti.sera.aggregate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ro.upb.etti.sera.config.RetentionProperties;
import ro.upb.etti.sera.telemetry.ReadingRepository;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Sterge citirile brute vechi. Agregatele orare raman definitiv, deci graficele pe
 * intervale lungi nu pierd nimic - doar rezolutia de secunde dispare.
 */
@Component
class RetentionJob {

    private static final Logger log = LoggerFactory.getLogger(RetentionJob.class);

    private final ReadingRepository repository;
    private final RetentionProperties properties;
    private final Clock clock;

    RetentionJob(ReadingRepository repository, RetentionProperties properties, Clock clock) {
        this.repository = repository;
        this.properties = properties;
        this.clock = clock;
    }

    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    void deleteOldReadings() {
        Instant cutoff = clock.instant().minus(properties.rawDays(), ChronoUnit.DAYS);
        int deleted = repository.deleteOlderThan(cutoff);
        log.info("Retention: {} citiri sterse, mai vechi de {}", deleted, cutoff);
    }
}
