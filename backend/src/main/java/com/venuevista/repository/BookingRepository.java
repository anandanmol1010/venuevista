package com.venuevista.repository;

import com.venuevista.entity.Booking;
import com.venuevista.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findTop10ByOrderByBookingDateDesc();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = 'CONFIRMED'")
    BigDecimal getTotalRevenue();

    long countByStatus(BookingStatus status);

    List<Booking> findByEventId(Long eventId);
}
