package com.mcgill.booking.repository;

import com.mcgill.booking.entity.BookingSlot;
import com.mcgill.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingSlotRepository extends JpaRepository<BookingSlot, Long> {
    // Find all slots created by a specific Professor
    List<BookingSlot> findByOwner(User owner);

    // Find all slots that are "Active" (Public) for students to see
    List<BookingSlot> findByIsActiveTrue();
}