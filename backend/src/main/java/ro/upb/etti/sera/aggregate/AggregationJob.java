package ro.upb.etti.sera.aggregate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Comprima citirile brute in agregate orare, pentru graficele pe intervale lungi.
 *
 * <p>Ruleaza la cinci minute dupa fiecare ora si recalculeaza ultimele doua ore: ora
 * tocmai incheiata plus cea dinainte, ca o repornire de backend la limita de ora sa nu
 * lase o gaura. Operatia este idempotenta, deci recalcularea nu produce duplicate.
 */
@Component
class AggregationJob {

    private static final Logger log = LoggerFactory.getLogger(AggregationJob.class);
    private static final Duration LOOKBACK = Duration.ofHours(2);

    private final ReadingHourlyRepository repository;
    private final Clock clock;

    AggregationJob(ReadingHourlyRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Scheduled(cron = "0 5 * * * *")
    @Transactional
    void aggregateRecentHours() {
        Instant to = clock.instant().truncatedTo(ChronoUnit.HOURS);
        Instant from = to.minus(LOOKBACK);
        int affected = repository.upsertHourlyBuckets(from, to);
        log.info("Agregare orara: {} bucket-uri actualizate pentru intervalul {} - {}", affected, from, to);
    }
}
