package com.mcgill.booking.service;

import com.mcgill.booking.entity.TimeSlot;
import com.mcgill.booking.entity.User;
import com.mcgill.booking.repository.TimeSlotRepository;
import com.mcgill.booking.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;

    public TimeSlotService(TimeSlotRepository timeSlotRepository, UserRepository userRepository) {
        this.timeSlotRepository = timeSlotRepository;
        this.userRepository = userRepository;
    }

    // Save a new time slot
    public TimeSlot createSlot(String email, LocalDateTime startTime, LocalDateTime endTime) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        TimeSlot slot = new TimeSlot();
        slot.setOwner(owner);
        slot.setStartTime(startTime);
        slot.setEndTime(endTime);
        slot.setBooked(false); // Default to not booked

        return timeSlotRepository.save(slot);
    }

    // Get all slots for a specific professor
    public List<TimeSlot> getSlotsByOwner(String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        return timeSlotRepository.findByOwnerId(owner.getId());
    }
}