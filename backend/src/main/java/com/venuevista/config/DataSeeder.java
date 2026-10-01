package com.venuevista.config;

import com.venuevista.entity.*;
import com.venuevista.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final SeatRepository seatRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, VenueRepository venueRepository,
                      SeatRepository seatRepository, EventRepository eventRepository,
                      BookingRepository bookingRepository, TicketRepository ticketRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.seatRepository = seatRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed if database is empty
        if (userRepository.count() > 0) {
            return;
        }

        // Create Admin
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@venuevista.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setPhone("9876543210");
        admin.setRole(Role.ADMIN);
        admin = userRepository.save(admin);

        // Create User
        User user = new User();
        user.setName("Rahul Sharma");
        user.setEmail("user@venuevista.com");
        user.setPassword(passwordEncoder.encode("User@123"));
        user.setPhone("9123456789");
        user.setRole(Role.USER);
        user = userRepository.save(user);

        // Create Venues
        Venue venue1 = createVenue("ABES Auditorium", "NH-24, Crossing Republik", "Ghaziabad", 200,
                "Main auditorium with modern sound system and stage lighting.");
        Venue venue2 = createVenue("City Convention Center", "Sector 62, Noida", "Noida", 500,
                "Large convention center suitable for conferences and exhibitions.");
        Venue venue3 = createVenue("Green Park Stadium", "MG Road", "Delhi", 1000,
                "Open air stadium for concerts and large events.");

        // Create Seats for Venue 1 (A-D, 6 seats each = 24 seats)
        createSeatsForVenue(venue1, 'A', 'B', 6, SeatType.VIP, new BigDecimal("1000"));
        createSeatsForVenue(venue1, 'C', 'D', 6, SeatType.PREMIUM, new BigDecimal("700"));
        createSeatsForVenue(venue1, 'E', 'H', 6, SeatType.REGULAR, new BigDecimal("500"));

        // Create Seats for Venue 2 (A-F, 8 seats each = 48 seats)
        createSeatsForVenue(venue2, 'A', 'B', 8, SeatType.VIP, new BigDecimal("1500"));
        createSeatsForVenue(venue2, 'C', 'D', 8, SeatType.PREMIUM, new BigDecimal("1000"));
        createSeatsForVenue(venue2, 'E', 'F', 8, SeatType.REGULAR, new BigDecimal("600"));

        // Create Seats for Venue 3 (A-E, 10 seats each = 50 seats)
        createSeatsForVenue(venue3, 'A', 'B', 10, SeatType.VIP, new BigDecimal("2000"));
        createSeatsForVenue(venue3, 'C', 'D', 10, SeatType.PREMIUM, new BigDecimal("1200"));
        createSeatsForVenue(venue3, 'E', 'E', 10, SeatType.REGULAR, new BigDecimal("800"));

        // Create Events
        Event event1 = createEvent("Tech Conference 2026", "Annual technology conference featuring talks on AI, Cloud Computing, and Web Development.",
                "Technology", LocalDate.of(2026, 10, 15), LocalTime.of(10, 0), LocalTime.of(17, 0), venue1, EventStatus.UPCOMING);

        Event event2 = createEvent("Music Night", "Live music performance featuring local bands and artists.",
                "Music", LocalDate.of(2026, 10, 20), LocalTime.of(18, 0), LocalTime.of(22, 0), venue3, EventStatus.UPCOMING);

        Event event3 = createEvent("Startup Pitch Day", "Entrepreneurs pitch their startup ideas to investors and mentors.",
                "Business", LocalDate.of(2026, 10, 25), LocalTime.of(9, 0), LocalTime.of(15, 0), venue2, EventStatus.UPCOMING);

        Event event4 = createEvent("Comedy Show", "Stand-up comedy night with popular comedians.",
                "Entertainment", LocalDate.of(2026, 11, 5), LocalTime.of(19, 0), LocalTime.of(21, 30), venue1, EventStatus.UPCOMING);

        Event event5 = createEvent("Cultural Fest", "Annual cultural festival with dance, drama, and art exhibitions.",
                "Cultural", LocalDate.of(2026, 11, 10), LocalTime.of(10, 0), LocalTime.of(20, 0), venue2, EventStatus.UPCOMING);

        // Create a sample booking for user
        Seat seatA1 = seatRepository.findByVenueIdOrderByRowNumberAscSeatNumberAsc(venue1.getId()).get(0);
        Seat seatA2 = seatRepository.findByVenueIdOrderByRowNumberAscSeatNumberAsc(venue1.getId()).get(1);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event1);
        booking.setTotalAmount(seatA1.getPrice().add(seatA2.getPrice()));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setBookingReference("VV-20261001-0001");
        booking = bookingRepository.save(booking);

        Ticket ticket1 = new Ticket();
        ticket1.setBooking(booking);
        ticket1.setSeat(seatA1);
        ticket1.setPrice(seatA1.getPrice());
        ticket1.setStatus(TicketStatus.ACTIVE);
        ticket1.setTicketNumber("VV-20261001-0001-T1");
        ticketRepository.save(ticket1);

        Ticket ticket2 = new Ticket();
        ticket2.setBooking(booking);
        ticket2.setSeat(seatA2);
        ticket2.setPrice(seatA2.getPrice());
        ticket2.setStatus(TicketStatus.ACTIVE);
        ticket2.setTicketNumber("VV-20261001-0001-T2");
        ticketRepository.save(ticket2);

        System.out.println("Sample data loaded successfully.");
    }

    private Venue createVenue(String name, String address, String city, int capacity, String description) {
        Venue venue = new Venue();
        venue.setName(name);
        venue.setAddress(address);
        venue.setCity(city);
        venue.setCapacity(capacity);
        venue.setDescription(description);
        return venueRepository.save(venue);
    }

    private void createSeatsForVenue(Venue venue, char startRow, char endRow, int seatsPerRow,
                                      SeatType seatType, BigDecimal price) {
        for (char row = startRow; row <= endRow; row++) {
            for (int seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                Seat seat = new Seat();
                seat.setVenue(venue);
                seat.setRowNumber(String.valueOf(row));
                seat.setSeatNumber(seatNum);
                seat.setSeatType(seatType);
                seat.setPrice(price);
                seatRepository.save(seat);
            }
        }
    }

    private Event createEvent(String title, String description, String category,
                               LocalDate date, LocalTime startTime, LocalTime endTime,
                               Venue venue, EventStatus status) {
        Event event = new Event();
        event.setTitle(title);
        event.setDescription(description);
        event.setCategory(category);
        event.setEventDate(date);
        event.setStartTime(startTime);
        event.setEndTime(endTime);
        event.setVenue(venue);
        event.setStatus(status);
        return eventRepository.save(event);
    }
}
