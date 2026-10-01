package com.venuevista.repository;

import com.venuevista.entity.Ticket;
import com.venuevista.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByBookingId(Long bookingId);

    // Find booked seat IDs for a given event (only active tickets)
    @Query("SELECT t.seat.id FROM Ticket t WHERE t.booking.event.id = :eventId AND t.status = 'ACTIVE' AND t.booking.status = 'CONFIRMED'")
    List<Long> findBookedSeatIdsByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.booking.event.id = :eventId AND t.status = 'ACTIVE' AND t.booking.status = 'CONFIRMED'")
    long countBookedSeatsByEventId(@Param("eventId") Long eventId);

    long countByStatus(TicketStatus status);
}
