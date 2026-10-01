package com.venuevista.controller;

import com.venuevista.dto.SeatConfigRequest;
import com.venuevista.dto.SeatDTO;
import com.venuevista.dto.VenueDTO;
import com.venuevista.service.SeatService;
import com.venuevista.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;
    private final SeatService seatService;

    public VenueController(VenueService venueService, SeatService seatService) {
        this.venueService = venueService;
        this.seatService = seatService;
    }

    @GetMapping
    public ResponseEntity<List<VenueDTO>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueDTO> getVenue(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @PostMapping
    public ResponseEntity<VenueDTO> createVenue(@Valid @RequestBody VenueDTO dto) {
        return ResponseEntity.ok(venueService.createVenue(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueDTO> updateVenue(@PathVariable Long id, @Valid @RequestBody VenueDTO dto) {
        return ResponseEntity.ok(venueService.updateVenue(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok().build();
    }

    // Seat endpoints under venue
    @GetMapping("/{venueId}/seats")
    public ResponseEntity<List<SeatDTO>> getSeats(@PathVariable Long venueId,
                                                   @RequestParam(required = false) Long eventId) {
        if (eventId != null) {
            return ResponseEntity.ok(seatService.getSeatsForEvent(venueId, eventId));
        }
        return ResponseEntity.ok(seatService.getSeatsByVenue(venueId));
    }

    @PostMapping("/{venueId}/seats")
    public ResponseEntity<List<SeatDTO>> configureSeats(@PathVariable Long venueId,
                                                         @Valid @RequestBody SeatConfigRequest request) {
        return ResponseEntity.ok(seatService.configureSeats(venueId, request));
    }

    @DeleteMapping("/{venueId}/seats")
    public ResponseEntity<Void> deleteAllSeats(@PathVariable Long venueId) {
        seatService.deleteAllSeats(venueId);
        return ResponseEntity.ok().build();
    }
}
