package com.mcgill.booking.repository;

import com.mcgill.booking.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    
    // Custom magic query to find all slots created by a specific professor
    List<TimeSlot> findByOwnerId(Long ownerId);
    
    // Custom magic query to find slots that haven't been booked by students yet
    List<TimeSlot> findByIsBookedFalse();
}