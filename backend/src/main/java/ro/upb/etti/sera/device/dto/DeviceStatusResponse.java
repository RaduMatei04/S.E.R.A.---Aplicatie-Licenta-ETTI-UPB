package ro.upb.etti.sera.device.dto;

import java.time.Instant;

/**
 * Starea statiei de senzori. {@code lastSeen} null inseamna ca nu a sosit niciodata
 * un mesaj - nu ca device-ul e offline de acum.
 */
public record DeviceStatusResponse(
        boolean online,
        Instant lastSeen,
        Long secondsSinceLastSeen,
        int reportedReadIntervalSecond,
        long offlineAfterSecond) {
}
