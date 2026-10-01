package com.venuevista.service;

import com.venuevista.dto.*;
import com.venuevista.entity.Booking;
import com.venuevista.entity.BookingStatus;
import com.venuevista.entity.Event;
import com.venuevista.entity.TicketStatus;
import com.venuevista.repository.*;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    public AdminService(EventRepository eventRepository, VenueRepository venueRepository,
                        UserRepository userRepository, BookingRepository bookingRepository,
                        TicketRepository ticketRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
    }

    public DashboardDTO getDashboard() {
        DashboardDTO dashboard = new DashboardDTO();
        dashboard.setTotalEvents(eventRepository.count());
        dashboard.setTotalVenues(venueRepository.count());
        dashboard.setTotalUsers(userRepository.count());
        dashboard.setTotalBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        dashboard.setTotalRevenue(bookingRepository.getTotalRevenue());

        // Recent bookings
        List<BookingDTO> recentBookings = bookingRepository.findTop10ByOrderByBookingDateDesc()
                .stream()
                .map(this::bookingToDTO)
                .collect(Collectors.toList());
        dashboard.setRecentBookings(recentBookings);

        return dashboard;
    }

    public List<EventSalesDTO> getEventSales() {
        List<Event> events = eventRepository.findAll();

        return events.stream().map(event -> {
            EventSalesDTO dto = new EventSalesDTO();
            dto.setEventId(event.getId());
            dto.setEventTitle(event.getTitle());
            dto.setCategory(event.getCategory());
            dto.setVenueName(event.getVenue().getName());

            List<Booking> eventBookings = bookingRepository.findByEventId(event.getId());
            long ticketsSold = eventBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                    .mapToLong(b -> b.getTickets().stream()
                            .filter(t -> t.getStatus() == TicketStatus.ACTIVE)
                            .count())
                    .sum();
            BigDecimal revenue = eventBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                    .map(Booking::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            dto.setTicketsSold(ticketsSold);
            dto.setRevenue(revenue);
            return dto;
        }).collect(Collectors.toList());
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole().name());
            dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
            return dto;
        }).collect(Collectors.toList());
    }

    private BookingDTO bookingToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());
        dto.setEventTitle(booking.getEvent().getTitle());
        dto.setEventId(booking.getEvent().getId());
        dto.setEventDate(booking.getEvent().getEventDate());
        dto.setEventStartTime(booking.getEvent().getStartTime());
        dto.setVenueName(booking.getEvent().getVenue().getName());
        dto.setVenueAddress(booking.getEvent().getVenue().getAddress());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setStatus(booking.getStatus().name());
        dto.setBookingDate(booking.getBookingDate());
        dto.setUserName(booking.getUser().getName());
        dto.setUserEmail(booking.getUser().getEmail());

        List<String> seatLabels = booking.getTickets().stream()
                .map(ticket -> ticket.getSeat().getSeatLabel())
                .sorted()
                .collect(Collectors.toList());
        dto.setSeatLabels(seatLabels);

        return dto;
    }
}
