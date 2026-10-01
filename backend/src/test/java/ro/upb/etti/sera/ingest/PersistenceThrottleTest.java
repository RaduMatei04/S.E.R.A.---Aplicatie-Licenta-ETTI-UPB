package ro.upb.etti.sera.ingest;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import ro.upb.etti.sera.config.IngestProperties;

import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class PersistenceThrottleTest {

    private final Instant start = Instant.parse("2026-10-01T10:00:00Z");
    private final PersistenceThrottle throttle = new PersistenceThrottle(
            new IngestProperties(Duration.ofSeconds(5), 20, 40, 70));

    @Test
    @DisplayName("prima citire se scrie intotdeauna")
    void allowsFirstSample() {
        assertThat(throttle.tryAcquire(start)).isTrue();
    }

    @Test
    @DisplayName("mesajele din interiorul intervalului nu se scriu")
    void rejectsSamplesInsideInterval() {
        throttle.tryAcquire(start);

        assertThat(throttle.tryAcquire(start.plusSeconds(1))).isFalse();
        assertThat(throttle.tryAcquire(start.plusSeconds(4))).isFalse();
    }

    @Test
    @DisplayName("dupa trecerea intervalului se scrie din nou")
    void allowsSampleAfterInterval() {
        throttle.tryAcquire(start);

        assertThat(throttle.tryAcquire(start.plusSeconds(5))).isTrue();
        assertThat(throttle.tryAcquire(start.plusSeconds(6))).isFalse();
        assertThat(throttle.tryAcquire(start.plusSeconds(10))).isTrue();
    }
}
