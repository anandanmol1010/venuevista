package com.venuevista.repository;

import com.venuevista.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByVenueIdOrderByRowNumberAscSeatNumberAsc(Long venueId);
    List<Seat> findByIdIn(List<Long> ids);
    void deleteByVenueId(Long venueId);
}
