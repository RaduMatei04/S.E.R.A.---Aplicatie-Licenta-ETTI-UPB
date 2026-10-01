package ro.upb.etti.sera.config;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;
import ro.upb.etti.sera.ingest.TelemetryIngestService;

/**
 * Abonarea la brokerul MQTT.
 *
 * <p>Brokerul este {@code sera-mosquitto}, din proiectul compose {@code infra}, partajat
 * cu Telegraf. Backend-ul este doar un al doilea abonat pe acelasi topic: MQTT fiind
 * publish/subscribe, cei doi consumatori nu se influenteaza.
 *
 * <p>Backend-ul nu publica NICIODATA pe MQTT - nu exista adaptor outbound aici, si nici
 * nu trebuie adaugat.
 */
@Configuration
class MqttConfig {

    private static final Logger log = LoggerFactory.getLogger(MqttConfig.class);

    private final MqttProperties properties;

    MqttConfig(MqttProperties properties) {
        this.properties = properties;
    }

    @Bean
    MqttPahoClientFactory mqttClientFactory() {
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{properties.url()});
        // Reconectare fara restart: daca brokerul repornește sau reteaua pica, clientul
        // revine singur si se reaboneaza.
        options.setAutomaticReconnect(true);
        // Paho creste exponential pauza dintre reincercari; plafonul o tine scurta,
        // ca revenirea dupa un restart de broker sa fie de ordinul secundelor.
        options.setMaxReconnectDelay((int) properties.maxReconnectDelay().toMillis());
        options.setCleanSession(false);
        options.setConnectionTimeout((int) properties.connectionTimeout().toSeconds());
        options.setKeepAliveInterval((int) properties.keepAliveInterval().toSeconds());

        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    @Bean
    MqttPahoMessageDrivenChannelAdapter mqttInbound(MqttPahoClientFactory clientFactory) {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
                properties.clientId(), clientFactory, properties.topic());
        adapter.setQos(properties.qos());
        adapter.setCompletionTimeout(properties.connectionTimeout().toMillis());
        adapter.setOutputChannel(mqttInputChannel());
        log.info("Abonare MQTT configurata: {} topic {} ca {}",
                properties.url(), properties.topic(), properties.clientId());
        return adapter;
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttInputChannel")
    MessageHandler mqttMessageHandler(TelemetryIngestService ingestService) {
        return message -> {
            // Atentie: MqttHeaders.RETAINED este header-ul de IESIRE. Mesajele primite
            // poarta RECEIVED_RETAINED - confuzia intre cele doua face ca filtrul de
            // mesaje retained sa nu se declanseze niciodata.
            boolean retained = Boolean.TRUE.equals(
                    message.getHeaders().get(MqttHeaders.RECEIVED_RETAINED, Boolean.class));
            ingestService.handle(message.getPayload().toString(), retained);
        };
    }
}
