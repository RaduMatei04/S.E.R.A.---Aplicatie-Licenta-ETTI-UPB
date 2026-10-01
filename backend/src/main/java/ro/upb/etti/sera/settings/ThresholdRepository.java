package ro.upb.etti.sera.settings;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.upb.etti.sera.telemetry.MetricCode;
import ro.upb.etti.sera.telemetry.PlantId;

import java.util.List;
import java.util.Optional;

public interface ThresholdRepository extends JpaRepository<Threshold, Long> {

    List<Threshold> findAllByOrderByMetricAscPlantIdAsc();

    Optional<Threshold> findByMetricAndPlantId(MetricCode metric, PlantId plantId);

    Optional<Threshold> findByMetricAndPlantIdIsNull(MetricCode metric);
}
