package ro.upb.etti.sera.common;

/** Resursa ceruta nu exista. Tradusa in 404 de {@link ApiExceptionHandler}. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
