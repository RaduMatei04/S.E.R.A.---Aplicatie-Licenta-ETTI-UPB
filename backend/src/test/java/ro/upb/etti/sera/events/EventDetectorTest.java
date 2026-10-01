package ro.upb.etti.sera.events;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import ro.upb.etti.sera.settings.SettingsService;
import ro.upb.etti.sera.settings.Threshold;
import ro.upb.etti.sera.telemetry.MetricCatalog;
import ro.upb.etti.sera.telemetry.MetricCode;
import ro.upb.etti.sera.telemetry.PlantId;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Device-ul publica la 1 Hz, deci regula care conteaza este ca o depasire continua sa
 * produca UN eveniment, nu cate unul pe secunda.
 */
class EventDetectorTest {

    private static final Instant NOW = Instant.parse("2026-10-01T10:00:00Z");

    private SettingsService settingsService;
    private EventService eventService;
    private EventDetector detector;

    @BeforeEach
    void setUp() throws Exception {
        settingsService = mock(SettingsService.class);
        eventService = mock(EventService.class);
        MetricCatalog catalog = mock(MetricCatalog.class);
        when(catalog.get(any())).thenReturn(null);

        when(settingsService.findEnabledThresholds())
                .thenReturn(List.of(threshold(MetricCode.TEMP_AIR, null, 10, 35)));

        detector = new EventDetector(settingsService, eventService, catalog);
    }

    @Test
    @DisplayName("o depasire continua produce un singur eveniment")
    void emitsOnlyOnTransitionIntoBreach() {
        detector.inspect(NOW, MetricCode.TEMP_AIR, null, BigDecimal.valueOf(40));
        detector.inspect(NOW.plusSeconds(1), MetricCode.TEMP_AIR, null, BigDecimal.valueOf(41));
        detector.inspect(NOW.plusSeconds(2), MetricCode.TEMP_AIR, null, BigDecimal.valueOf(42));

        verify(eventService, times(1)).record(any(), eq(EventType.THRESHOLD_HIGH), eq(Severity.WARNING),
                any(), any(), any(), any());
    }

    @Test
    @DisplayName("revenirea in interval produce un eveniment informativ")
    void emitsRecoveryAfterBreach() {
        detector.inspect(NOW, MetricCode.TEMP_AIR, null, BigDecimal.valueOf(40));
        detector.inspect(NOW.plusSeconds(1), MetricCode.TEMP_AIR, null, BigDecimal.valueOf(25));

        verify(eventService, times(1)).record(any(), any(), eq(Severity.INFO),
                any(), any(), any(), any());
    }

    @Test
    @DisplayName("prima citire normala nu raporteaza o revenire din nimic")
    void staysSilentWhenFirstValueIsNormal() {
        detector.inspect(NOW, MetricCode.TEMP_AIR, null, BigDecimal.valueOf(22));

        verify(eventService, never()).record(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("o metrica fara prag configurat este ignorata")
    void ignoresMetricWithoutThreshold() {
        detector.inspect(NOW, MetricCode.LUX, null, BigDecimal.valueOf(90000));

        verify(eventService, never()).record(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("plantele au praguri independente")
    void tracksPlantsSeparately() {
        when(settingsService.findEnabledThresholds()).thenReturn(List.of(
                threshold(MetricCode.SOIL_MOISTURE, PlantId.P1, 20, 90),
                threshold(MetricCode.SOIL_MOISTURE, PlantId.P2, 20, 90)));

        detector.inspect(NOW, MetricCode.SOIL_MOISTURE, PlantId.P1, BigDecimal.valueOf(95));
        detector.inspect(NOW, MetricCode.SOIL_MOISTURE, PlantId.P2, BigDecimal.valueOf(95));

        verify(eventService, times(2)).record(any(), eq(EventType.THRESHOLD_HIGH), any(),
                any(), any(), any(), any());
    }

    /** Threshold are constructor protejat pentru Hibernate; testul il populeaza direct. */
    private static Threshold threshold(MetricCode metric, PlantId plantId, int min, int max) {
        try {
            Threshold threshold = newInstance();
            set(threshold, "metric", metric);
            set(threshold, "plantId", plantId);
            threshold.update(BigDecimal.valueOf(min), BigDecimal.valueOf(max), true);
            assertThat(threshold.isEnabled()).isTrue();
            return threshold;
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static Threshold newInstance() throws Exception {
        var constructor = Threshold.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        return constructor.newInstance();
    }

    private static void set(Threshold target, String fieldName, Object value) throws Exception {
        Field field = Threshold.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
