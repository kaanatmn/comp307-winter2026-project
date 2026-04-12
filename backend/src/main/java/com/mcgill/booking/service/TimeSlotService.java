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

    // NEW: Added the 'weeks' parameter for Type 3 recurring slots!
    public void createSlot(String email, LocalDateTime startTime, LocalDateTime endTime, int weeks) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Owner not found"));
        
        for (int i = 0; i < weeks; i++) {
            TimeSlot slot = new TimeSlot();
            slot.setOwner(owner);
            slot.setStartTime(startTime.plusWeeks(i));
            slot.setEndTime(endTime.plusWeeks(i));
            slot.setBooked(false);
            slot.setActive(false);
            slot.setType("1-on-1");
            slot.setTitle("Office Hours");
            timeSlotRepository.save(slot);
        }
    }

    public List<TimeSlot> getSlotsByOwner(String email) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Owner not found"));
        return timeSlotRepository.findByOwnerId(owner.getId());
    }

    public List<TimeSlot> getAllAvailableSlots() {
        return timeSlotRepository.findByIsBookedFalseAndIsActiveTrue();
    }

    public List<TimeSlot> getSlotsByStudent(String email) {
        User student = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Student not found"));
        return timeSlotRepository.findByStudentId(student.getId());
    }

    public TimeSlot activateSlot(Long slotId, String ownerEmail) {
        TimeSlot slot = timeSlotRepository.findById(slotId).orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getOwner().getEmail().equals(ownerEmail)) throw new RuntimeException("Unauthorized");
        slot.setActive(true);
        return timeSlotRepository.save(slot);
    }

    public TimeSlot deactivateSlot(Long slotId, String ownerEmail) {
        TimeSlot slot = timeSlotRepository.findById(slotId).orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getOwner().getEmail().equals(ownerEmail)) throw new RuntimeException("Unauthorized");
        if (slot.isBooked()) throw new RuntimeException("Cannot deactivate a booked slot. Cancel the appointment first.");
        slot.setActive(false);
        return timeSlotRepository.save(slot);
    }

    public void deleteSlot(Long slotId, String ownerEmail) {
        TimeSlot slot = timeSlotRepository.findById(slotId).orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getOwner().getEmail().equals(ownerEmail)) throw new RuntimeException("Unauthorized");
        timeSlotRepository.delete(slot);
    }

    public TimeSlot bookSlot(Long slotId, String studentEmail) {
        TimeSlot slot = timeSlotRepository.findById(slotId).orElseThrow(() -> new RuntimeException("Slot not found"));
        User student = userRepository.findByEmail(studentEmail).orElseThrow(() -> new RuntimeException("Student not found"));
        if (slot.isBooked() || !slot.isActive()) throw new RuntimeException("Slot is not available");
        slot.setBooked(true);
        slot.setStudent(student);
        return timeSlotRepository.save(slot);
    }

    public TimeSlot cancelBooking(Long slotId, String studentEmail) {
        TimeSlot slot = timeSlotRepository.findById(slotId).orElseThrow(() -> new RuntimeException("Slot not found"));
        if (slot.getStudent() == null || !slot.getStudent().getEmail().equals(studentEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        slot.setBooked(false);
        slot.setStudent(null);
        return timeSlotRepository.save(slot);
    }
}