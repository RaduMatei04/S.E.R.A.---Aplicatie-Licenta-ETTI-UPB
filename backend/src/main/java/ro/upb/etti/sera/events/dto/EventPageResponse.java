package ro.upb.etti.sera.events.dto;

import java.util.List;

public record EventPageResponse(
        List<EventResponse> items,
        int page,
        int size,
        long totalItems,
        int totalPages) {
}
