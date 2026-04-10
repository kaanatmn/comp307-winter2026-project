package com.mcgill.booking.repository;

import com.mcgill.booking.entity.BookingSlot;
import com.mcgill.booking.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSlotRepository extends CrudRepository<BookingSlot, Long> {
    
    // Finds only activated slots for the students to see globally
    List<BookingSlot> findByActiveTrue(); 

    // Finds all slots created by a specific owner for their dashboard
    List<BookingSlot> findByOwner(User owner);

    // NEW: Finds ONLY the active slots for a specific owner (For the Student Dashboard)
    List<BookingSlot> findByOwnerAndActiveTrue(User owner);
}