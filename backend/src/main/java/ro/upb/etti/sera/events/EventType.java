package ro.upb.etti.sera.events;

/** Tipurile de evenimente derivate de backend. Trebuie sa coincida cu CHECK-ul din V1. */
public enum EventType {
    THRESHOLD_HIGH,
    THRESHOLD_LOW,
    DEVICE_OFFLINE,
    DEVICE_ONLINE,
    INVALID_READING
}
