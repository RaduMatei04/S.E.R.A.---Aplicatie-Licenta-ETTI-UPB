package ro.upb.etti.sera.device;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.upb.etti.sera.device.dto.DeviceStatusResponse;

@RestController
@RequestMapping("/api/v1/device")
class DeviceController {

    private final DeviceStatusService service;

    DeviceController(DeviceStatusService service) {
        this.service = service;
    }

    @GetMapping("/status")
    DeviceStatusResponse status() {
        return service.status();
    }
}
