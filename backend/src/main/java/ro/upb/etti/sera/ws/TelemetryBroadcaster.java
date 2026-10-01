package ro.upb.etti.sera.ws;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Push catre frontend. Se trimite la FIECARE mesaj MQTT (1 Hz), spre deosebire de
 * persistenta, care este limitata la un interval mai mare - interfata ramane vie fara
 * ca baza de date sa creasca inutil.
 */
@Component
public class TelemetryBroadcaster {

    public static final String TOPIC_TELEMETRY = "/topic/telemetry";
    public static final String TOPIC_EVENTS = "/topic/events";
    public static final String TOPIC_DEVICE = "/topic/device";

    private final SimpMessagingTemplate messagingTemplate;

    TelemetryBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastTelemetry(Object payload) {
        messagingTemplate.convertAndSend(TOPIC_TELEMETRY, payload);
    }

    public void broadcastEvent(Object payload) {
        messagingTemplate.convertAndSend(TOPIC_EVENTS, payload);
    }

    public void broadcastDeviceStatus(Object payload) {
        messagingTemplate.convertAndSend(TOPIC_DEVICE, payload);
    }
}
