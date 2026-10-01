package ro.upb.etti.sera.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Conexiunea la brokerul MQTT. Brokerul apartine proiectului `infra`
 * (sera-code/infra/docker-compose.yml) si este partajat cu Telegraf.
 */
@ConfigurationProperties(prefix = "sera.mqtt")
public record MqttProperties(
        String url,
        String clientId,
        String topic,
        int qos,
        Duration connectionTimeout,
        Duration keepAliveInterval,
        Duration maxReconnectDelay) {
}
