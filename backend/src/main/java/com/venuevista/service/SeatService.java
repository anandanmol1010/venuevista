package com.venuevista.service;

import com.venuevista.dto.SeatConfigRequest;
import com.venuevista.dto.SeatDTO;
import com.venuevista.entity.Seat;
import com.venuevista.entity.SeatType;
import com.venuevista.entity.Venue;
import com.venuevista.exception.ResourceNotFoundException;
import com.venuevista.repository.SeatRepository;
import com.venuevista.repository.TicketRepository;
import com.venuevista.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final VenueRepository venueRepository;
    private final TicketRepository ticketRepository;

    public SeatService(SeatRepository seatRepository, VenueRepository venueRepository,
                       TicketRepository ticketRepository) {
        this.seatRepository = seatRepository;
        this.venueRepository = venueRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<SeatDTO> getSeatsByVenue(Long venueId) {
        venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        return seatRepository.findByVenueIdOrderByRowNumberAscSeatNumberAsc(venueId).stream()
                .map(seat -> toDTO(seat, false))
                .collect(Collectors.toList());
    }

    // Get seats with booking status for a specific event
    public List<SeatDTO> getSeatsForEvent(Long venueId, Long eventId) {
        venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        List<Seat> seats = seatRepository.findByVenueIdOrderByRowNumberAscSeatNumberAsc(venueId);
        Set<Long> bookedSeatIds = new HashSet<>(ticketRepository.findBookedSeatIdsByEventId(eventId));

        return seats.stream()
                .map(seat -> toDTO(seat, bookedSeatIds.contains(seat.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<SeatDTO> configureSeats(Long venueId, SeatConfigRequest request) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        SeatType seatType = SeatType.valueOf(request.getSeatType().toUpperCase());

        List<Seat> newSeats = new ArrayList<>();
        char startRow = request.getStartRow().toUpperCase().charAt(0);
        char endRow = request.getEndRow().toUpperCase().charAt(0);

        for (char row = startRow; row <= endRow; row++) {
            for (int seatNum = 1; seatNum <= request.getSeatsPerRow(); seatNum++) {
                Seat seat = new Seat();
                seat.setVenue(venue);
                seat.setRowNumber(String.valueOf(row));
                seat.setSeatNumber(seatNum);
                seat.setSeatType(seatType);
                seat.setPrice(request.getPrice());
                newSeats.add(seat);
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(newSeats);
        return savedSeats.stream()
                .map(seat -> toDTO(seat, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAllSeats(Long venueId) {
        venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        seatRepository.deleteByVenueId(venueId);
    }

    public SeatDTO updateSeat(Long seatId, SeatDTO dto) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found"));

        if (dto.getSeatType() != null) seat.setSeatType(dto.getSeatType());
        if (dto.getPrice() != null) seat.setPrice(dto.getPrice());

        seat = seatRepository.save(seat);
        return toDTO(seat, false);
    }

    private SeatDTO toDTO(Seat seat, boolean booked) {
        SeatDTO dto = new SeatDTO();
        dto.setId(seat.getId());
        dto.setRowNumber(seat.getRowNumber());
        dto.setSeatNumber(seat.getSeatNumber());
        dto.setSeatType(seat.getSeatType());
        dto.setPrice(seat.getPrice());
        dto.setVenueId(seat.getVenue().getId());
        dto.setSeatLabel(seat.getSeatLabel());
        dto.setBooked(booked);
        return dto;
    }
}
