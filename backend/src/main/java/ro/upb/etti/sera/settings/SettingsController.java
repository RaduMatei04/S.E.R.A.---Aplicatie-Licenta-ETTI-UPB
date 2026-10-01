package ro.upb.etti.sera.settings;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.upb.etti.sera.settings.dto.SettingsResponse;
import ro.upb.etti.sera.settings.dto.UpdateSettingsRequest;

@RestController
@RequestMapping("/api/v1/settings")
class SettingsController {

    private final SettingsService service;

    SettingsController(SettingsService service) {
        this.service = service;
    }

    @GetMapping
    SettingsResponse find() {
        return service.find();
    }

    @PutMapping
    SettingsResponse update(@Valid @RequestBody UpdateSettingsRequest request) {
        return service.update(request);
    }
}
