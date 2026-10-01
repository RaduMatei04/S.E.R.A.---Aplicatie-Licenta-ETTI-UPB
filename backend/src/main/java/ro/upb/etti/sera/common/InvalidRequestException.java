package ro.upb.etti.sera.common;

/** Cererea este sintactic valida, dar incalca o regula de domeniu. Devine 400. */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
