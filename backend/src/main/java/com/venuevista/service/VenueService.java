package com.venuevista.service;

import com.venuevista.dto.VenueDTO;
import com.venuevista.entity.Venue;
import com.venuevista.exception.BadRequestException;
import com.venuevista.exception.ResourceNotFoundException;
import com.venuevista.repository.EventRepository;
import com.venuevista.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;

    public VenueService(VenueRepository venueRepository, EventRepository eventRepository) {
        this.venueRepository = venueRepository;
        this.eventRepository = eventRepository;
    }

    public List<VenueDTO> getAllVenues() {
        return venueRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public VenueDTO getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        return toDTO(venue);
    }

    public VenueDTO createVenue(VenueDTO dto) {
        Venue venue = new Venue();
        venue.setName(dto.getName());
        venue.setAddress(dto.getAddress());
        venue.setCity(dto.getCity());
        venue.setCapacity(dto.getCapacity());
        venue.setDescription(dto.getDescription());

        venue = venueRepository.save(venue);
        return toDTO(venue);
    }

    public VenueDTO updateVenue(Long id, VenueDTO dto) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        venue.setName(dto.getName());
        venue.setAddress(dto.getAddress());
        venue.setCity(dto.getCity());
        venue.setCapacity(dto.getCapacity());
        venue.setDescription(dto.getDescription());

        venue = venueRepository.save(venue);
        return toDTO(venue);
    }

    public void deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        if (!eventRepository.findByVenueId(id).isEmpty()) {
            throw new BadRequestException("Cannot delete venue with existing events");
        }

        venueRepository.delete(venue);
    }

    private VenueDTO toDTO(Venue venue) {
        VenueDTO dto = new VenueDTO();
        dto.setId(venue.getId());
        dto.setName(venue.getName());
        dto.setAddress(venue.getAddress());
        dto.setCity(venue.getCity());
        dto.setCapacity(venue.getCapacity());
        dto.setDescription(venue.getDescription());
        dto.setTotalSeats(venue.getSeats() != null ? venue.getSeats().size() : 0);
        return dto;
    }
}
