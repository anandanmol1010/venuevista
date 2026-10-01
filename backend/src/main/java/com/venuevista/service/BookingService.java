package com.venuevista.service;

import com.venuevista.dto.BookingDTO;
import com.venuevista.dto.BookingRequest;
import com.venuevista.entity.*;
import com.venuevista.exception.BadRequestException;
import com.venuevista.exception.ResourceNotFoundException;
import com.venuevista.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, EventRepository eventRepository,
                          SeatRepository seatRepository, TicketRepository ticketRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingDTO createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (event.getStatus() != EventStatus.UPCOMING && event.getStatus() != EventStatus.ONGOING) {
            throw new BadRequestException("Event is not available for booking");
        }

        List<Seat> seats = seatRepository.findByIdIn(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new BadRequestException("One or more seats not found");
        }

        // Verify all seats belong to the event venue
        for (Seat seat : seats) {
            if (!seat.getVenue().getId().equals(event.getVenue().getId())) {
                throw new BadRequestException("Seat " + seat.getSeatLabel() + " does not belong to the event venue");
            }
        }

        // Check if any seat is already booked for this event
        Set<Long> bookedSeatIds = new HashSet<>(ticketRepository.findBookedSeatIdsByEventId(event.getId()));
        for (Seat seat : seats) {
            if (bookedSeatIds.contains(seat.getId())) {
                throw new BadRequestException("Seat " + seat.getSeatLabel() + " is already booked");
            }
        }

        // Calculate total from DB prices (don't trust frontend)
        BigDecimal totalAmount = seats.stream()
                .map(Seat::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Generate booking reference
        String bookingRef = generateBookingReference();

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setBookingReference(bookingRef);

        booking = bookingRepository.save(booking);

        // Create tickets for each seat
        int ticketCount = 1;
        for (Seat seat : seats) {
            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setSeat(seat);
            ticket.setPrice(seat.getPrice());
            ticket.setStatus(TicketStatus.ACTIVE);
            ticket.setTicketNumber(bookingRef + "-T" + ticketCount++);
            booking.getTickets().add(ticket);
        }

        ticketRepository.saveAll(booking.getTickets());

        return toDTO(booking);
    }

    public List<BookingDTO> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO getBookingById(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Users can only see their own bookings (admin check done at controller level)
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You don't have permission to view this booking");
        }

        return toDTO(booking);
    }

    @Transactional
    public BookingDTO cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You don't have permission to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        for (Ticket ticket : booking.getTickets()) {
            ticket.setStatus(TicketStatus.CANCELLED);
        }

        bookingRepository.save(booking);
        return toDTO(booking);
    }

    // Admin: get all bookings
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private String generateBookingReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = String.format("%04d", new Random().nextInt(10000));
        return "VV-" + datePart + "-" + randomPart;
    }

    private BookingDTO toDTO(Booking booking) {
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
