package ro.upb.etti.sera.ingest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ro.upb.etti.sera.telemetry.Reading;
import ro.upb.etti.sera.telemetry.ReadingRepository;
import ro.upb.etti.sera.telemetry.Sample;

import java.util.List;

/**
 * Scrierea citirilor, intr-o componenta separata de serviciul de ingest.
 *
 * <p>Separarea nu e cosmetica: {@code @Transactional} functioneaza prin proxy, deci o
 * metoda tranzactionala apelata din aceeasi clasa ar rula fara tranzactie.
 */
@Component
class ReadingWriter {

    private static final Logger log = LoggerFactory.getLogger(ReadingWriter.class);

    private final ReadingRepository repository;

    ReadingWriter(ReadingRepository repository) {
        this.repository = repository;
    }

    @Transactional
    void write(List<Sample> samples, String rawPayload) {
        List<Reading> readings = samples.stream()
                .map(sample -> new Reading(
                        sample.ts(), sample.metric(), sample.plantId(), sample.value(), rawPayload))
                .toList();
        repository.saveAll(readings);
        log.debug("Persistate {} citiri", readings.size());
    }
}
