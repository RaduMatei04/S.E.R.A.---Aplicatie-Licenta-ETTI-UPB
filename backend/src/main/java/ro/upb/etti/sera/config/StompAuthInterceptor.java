package ro.upb.etti.sera.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Autentificarea conexiunii WebSocket.
 *
 * <p>Un browser nu poate adauga anteturi la handshake-ul WebSocket, iar trimiterea
 * token-ului prin query string l-ar expune in loguri de proxy si in istoricul
 * browserului. Solutia este sa lasam handshake-ul HTTP liber si sa cerem token-ul in
 * cadrul CONNECT al protocolului STOMP, unde clientul poate trimite anteturi normale.
 */
@Component
class StompAuthInterceptor implements ChannelInterceptor {

    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtDecoder jwtDecoder;

    StompAuthInterceptor(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        Jwt jwt = jwtDecoder.decode(extractToken(accessor));
        accessor.setUser(new UsernamePasswordAuthenticationToken(jwt.getSubject(), null, List.of()));
        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        List<String> values = accessor.getNativeHeader(AUTHORIZATION);
        if (values == null || values.isEmpty() || !values.get(0).startsWith(BEARER_PREFIX)) {
            throw new IllegalArgumentException("Conexiunea WebSocket necesita un token de acces");
        }
        return values.get(0).substring(BEARER_PREFIX.length());
    }
}
