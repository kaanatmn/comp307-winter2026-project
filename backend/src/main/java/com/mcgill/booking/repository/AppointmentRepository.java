package com.mcgill.booking.repository;

import com.mcgill.booking.entity.Appointment;
import com.mcgill.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Find all bookings made by a specific Student
    List<Appointment> findByUser(User user);
    
    // Find all attendees for a specific slot (Type 2 Group meetings)
    List<Appointment> findByBookingSlotId(Long slotId);
}