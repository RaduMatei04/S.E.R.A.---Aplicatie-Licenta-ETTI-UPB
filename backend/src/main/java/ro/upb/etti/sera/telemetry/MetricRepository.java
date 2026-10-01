package ro.upb.etti.sera.telemetry;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MetricRepository extends JpaRepository<Metric, MetricCode> {

    List<Metric> findAllByOrderBySortOrderAsc();
}
