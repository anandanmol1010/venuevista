package com.venuevista.repository;

import com.venuevista.entity.Event;
import com.venuevista.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(EventStatus status);

    @Query("SELECT e FROM Event e WHERE " +
           "(:title IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:category IS NULL OR LOWER(e.category) = LOWER(:category)) AND " +
           "(:city IS NULL OR LOWER(e.venue.city) = LOWER(:city)) " +
           "ORDER BY e.eventDate ASC")
    List<Event> searchEvents(@Param("title") String title,
                             @Param("category") String category,
                             @Param("city") String city);

    List<Event> findByVenueId(Long venueId);
}
