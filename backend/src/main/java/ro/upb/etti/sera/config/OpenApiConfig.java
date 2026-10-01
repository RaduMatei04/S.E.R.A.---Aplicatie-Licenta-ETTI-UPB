package ro.upb.etti.sera.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class OpenApiConfig {

    @Bean
    OpenAPI seraOpenApi() {
        return new OpenAPI().info(new Info()
                .title("SERA API")
                .version("v1")
                .description("Telemetrie, evenimente si configurare pentru sera monitorizata cu ESP32."));
    }
}
