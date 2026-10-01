package com.venuevista.service;

import com.venuevista.dto.EventDTO;
import com.venuevista.entity.Event;
import com.venuevista.entity.EventStatus;
import com.venuevista.entity.Venue;
import com.venuevista.exception.ResourceNotFoundException;
import com.venuevista.repository.EventRepository;
import com.venuevista.repository.SeatRepository;
import com.venuevista.repository.TicketRepository;
import com.venuevista.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;

    public EventService(EventRepository eventRepository, VenueRepository venueRepository,
                        SeatRepository seatRepository, TicketRepository ticketRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.seatRepository = seatRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return toDTO(event);
    }

    public List<EventDTO> searchEvents(String title, String category, String city) {
        return eventRepository.searchEvents(title, category, city).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EventDTO createEvent(EventDTO dto) {
        Venue venue = venueRepository.findById(dto.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setCategory(dto.getCategory());
        event.setEventDate(dto.getEventDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setVenue(venue);
        event.setStatus(dto.getStatus() != null ? EventStatus.valueOf(dto.getStatus()) : EventStatus.UPCOMING);
        event.setImageUrl(dto.getImageUrl());

        event = eventRepository.save(event);
        return toDTO(event);
    }

    public EventDTO updateEvent(Long id, EventDTO dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        Venue venue = venueRepository.findById(dto.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setCategory(dto.getCategory());
        event.setEventDate(dto.getEventDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setVenue(venue);
        event.setStatus(dto.getStatus() != null ? EventStatus.valueOf(dto.getStatus()) : event.getStatus());
        event.setImageUrl(dto.getImageUrl());

        event = eventRepository.save(event);
        return toDTO(event);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        eventRepository.delete(event);
    }

    private EventDTO toDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setCategory(event.getCategory());
        dto.setEventDate(event.getEventDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setVenueId(event.getVenue().getId());
        dto.setVenueName(event.getVenue().getName());
        dto.setVenueCity(event.getVenue().getCity());
        dto.setVenueAddress(event.getVenue().getAddress());
        dto.setStatus(event.getStatus().name());
        dto.setImageUrl(event.getImageUrl());

        int totalSeats = seatRepository.findByVenueIdOrderByRowNumberAscSeatNumberAsc(event.getVenue().getId()).size();
        long bookedSeats = ticketRepository.countBookedSeatsByEventId(event.getId());
        dto.setTotalSeats(totalSeats);
        dto.setAvailableSeats(totalSeats - (int) bookedSeats);

        return dto;
    }
}
