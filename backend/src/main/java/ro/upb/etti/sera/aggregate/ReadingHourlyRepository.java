package ro.upb.etti.sera.aggregate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.upb.etti.sera.telemetry.MetricCode;
import ro.upb.etti.sera.telemetry.PlantId;

import java.time.Instant;
import java.util.List;

public interface ReadingHourlyRepository extends JpaRepository<ReadingHourly, Long> {

    List<ReadingHourly> findByMetricAndPlantIdAndBucketBetweenOrderByBucketAsc(
            MetricCode metric, PlantId plantId, Instant from, Instant to);

    List<ReadingHourly> findByMetricAndPlantIdIsNullAndBucketBetweenOrderByBucketAsc(
            MetricCode metric, Instant from, Instant to);

    /**
     * Recalculeaza agregatele pentru bucket-urile incheiate din interval si le scrie
     * idempotent: o reluare a jobului produce acelasi rezultat, nu randuri duplicate.
     */
    @Modifying
    @Query(value = """
            INSERT INTO reading_hourly (bucket, metric, plant_id, min_value, avg_value, max_value, sample_count)
            SELECT date_trunc('hour', ts) AS bucket,
                   metric,
                   plant_id,
                   MIN(value),
                   AVG(value),
                   MAX(value),
                   COUNT(*)
            FROM reading
            WHERE ts >= :from AND ts < :to
            GROUP BY 1, 2, 3
            ON CONFLICT (bucket, metric, plant_id) DO UPDATE SET
                min_value    = EXCLUDED.min_value,
                avg_value    = EXCLUDED.avg_value,
                max_value    = EXCLUDED.max_value,
                sample_count = EXCLUDED.sample_count
            """, nativeQuery = true)
    int upsertHourlyBuckets(@Param("from") Instant from, @Param("to") Instant to);
}
