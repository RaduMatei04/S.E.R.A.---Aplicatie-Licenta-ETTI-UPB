package ro.upb.etti.sera.events;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("""
            SELECT e FROM Event e
            WHERE e.ts >= :from
              AND e.ts <= :to
              AND (:type IS NULL OR e.type = :type)
            ORDER BY e.ts DESC
            """)
    Page<Event> search(@Param("from") Instant from,
                       @Param("to") Instant to,
                       @Param("type") EventType type,
                       Pageable pageable);
}
