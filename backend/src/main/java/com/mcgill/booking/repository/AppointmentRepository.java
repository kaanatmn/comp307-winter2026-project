package com.mcgill.booking.repository;

import com.mcgill.booking.entity.Appointment;
import com.mcgill.booking.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends CrudRepository<Appointment, Long> {
    
    // FIXED: Changed findByUser to findByStudent to match the Appointment entity
    List<Appointment> findByStudent(User student); 
}