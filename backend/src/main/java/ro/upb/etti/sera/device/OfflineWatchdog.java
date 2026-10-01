package ro.upb.etti.sera.device;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Verifica periodic daca device-ul a tacut. Intervalul vine din configurare, ca sa
 * poata fi scurtat in teste si in demonstratii.
 */
@Component
class OfflineWatchdog {

    private final DeviceStatusService deviceStatusService;

    OfflineWatchdog(DeviceStatusService deviceStatusService) {
        this.deviceStatusService = deviceStatusService;
    }

    @Scheduled(fixedDelayString = "${sera.device.watchdog-interval}")
    void detectSilence() {
        deviceStatusService.checkForSilence();
    }
}
