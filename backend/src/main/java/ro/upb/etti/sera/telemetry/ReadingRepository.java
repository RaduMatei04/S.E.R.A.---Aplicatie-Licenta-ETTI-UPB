package ro.upb.etti.sera.telemetry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ReadingRepository extends JpaRepository<Reading, Long> {

    /**
     * Ultima citire pentru fiecare combinatie metrica/planta. DISTINCT ON este specific
     * Postgres si este motivul pentru care testele folosesc Testcontainers, nu H2.
     */
    @Query(value = """
            SELECT DISTINCT ON (metric, plant_id)
                   metric    AS metric,
                   plant_id  AS plantId,
                   value     AS value,
                   ts        AS ts
            FROM reading
            ORDER BY metric, plant_id, ts DESC
            """, nativeQuery = true)
    List<LatestReading> findLatestPerMetric();

    List<Reading> findByMetricAndPlantIdAndTsBetweenOrderByTsAsc(
            MetricCode metric, PlantId plantId, Instant from, Instant to);

    List<Reading> findByMetricAndPlantIdIsNullAndTsBetweenOrderByTsAsc(
            MetricCode metric, Instant from, Instant to);

    @Query("SELECT MAX(r.ts) FROM Reading r")
    Optional<Instant> findLatestTimestamp();

    @Modifying
    @Query("DELETE FROM Reading r WHERE r.ts < :cutoff")
    int deleteOlderThan(@Param("cutoff") Instant cutoff);
}
