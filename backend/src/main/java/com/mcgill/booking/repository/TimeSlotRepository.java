package com.mcgill.booking.repository;

import com.mcgill.booking.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    
    List<TimeSlot> findByOwnerId(Long ownerId);
    
    // NEW: Find slots for the Student Directory (Must be unbooked AND activated)
    List<TimeSlot> findByIsBookedFalseAndIsActiveTrue();

    // NEW: Find all slots a specific student has booked
    List<TimeSlot> findByStudentId(Long studentId);
}