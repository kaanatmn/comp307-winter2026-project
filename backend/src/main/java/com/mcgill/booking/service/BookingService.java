package com.mcgill.booking.service;

import com.mcgill.booking.entity.Appointment;
import com.mcgill.booking.entity.BookingSlot;
import com.mcgill.booking.entity.User;
import com.mcgill.booking.repository.AppointmentRepository;
import com.mcgill.booking.repository.BookingSlotRepository;
import com.mcgill.booking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {

    private final BookingSlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public BookingService(BookingSlotRepository slotRepository, 
                          AppointmentRepository appointmentRepository, 
                          UserRepository userRepository) {
        this.slotRepository = slotRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    // owner
    @Transactional
    public List<BookingSlot> createSlot(String ownerEmail, String title, LocalDateTime start, LocalDateTime end, BookingSlot.SlotType type, Integer recurringWeeks) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        if (owner.getRole() != User.Role.OWNER) {
            throw new IllegalStateException("Only @mcgill.ca accounts can create slots.");
        }

        List<BookingSlot> createdSlots = new ArrayList<>();
        int weeks = (recurringWeeks != null && recurringWeeks > 0) ? recurringWeeks : 1;

        for (int i = 0; i < weeks; i++) {
            BookingSlot slot = new BookingSlot();
            slot.setOwner(owner);
            slot.setTitle(title);
            slot.setStartTime(start.plusWeeks(i));
            slot.setEndTime(end.plusWeeks(i));
            slot.setType(type);
            slot.setActive(false); 
            createdSlots.add(slotRepository.save(slot));
        }

        return createdSlots;
    }

    @Transactional
    public BookingSlot activateSlot(Long slotId, String ownerEmail) {
        BookingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
        
        if (!slot.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("You can only activate your own slots.");
        }

        slot.setActive(true);
        return slotRepository.save(slot);
    }

    @Transactional
    public Appointment respondToRequest(Long appointmentId, String ownerEmail, boolean isApproved) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appt.getSlot().getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Only the owner can approve this request.");
        }

        if (isApproved) {
            appt.setStatus(Appointment.Status.APPROVED);
            BookingSlot slot = appt.getSlot();
            slot.setCurrentSelectionCount(slot.getCurrentSelectionCount() + 1);
            slotRepository.save(slot);
        } else {
            appt.setStatus(Appointment.Status.DECLINED);
        }
        return appointmentRepository.save(appt);
    }

    public List<BookingSlot> getOwnerSlots(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));
        return slotRepository.findByOwner(owner);
    }

    // student
    @Transactional
    public Appointment bookSlot(Long slotId, String studentEmail) {
        BookingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        if (!slot.isActive()) {
            throw new IllegalStateException("This slot is not active yet.");
        }

        if (slot.getCurrentSelectionCount() >= slot.getMaxAttendees()) {
            throw new IllegalStateException("This slot is already fully booked.");
        }

        Appointment appointment = new Appointment();
        appointment.setSlot(slot);
        appointment.setStudent(student);

        if (slot.getType() == BookingSlot.SlotType.REQUEST_MEETING) {
            appointment.setStatus(Appointment.Status.PENDING);
        } else {
            appointment.setStatus(Appointment.Status.APPROVED);
            slot.setCurrentSelectionCount(slot.getCurrentSelectionCount() + 1);
            slotRepository.save(slot);
        }

        return appointmentRepository.save(appointment);
    }

    public List<BookingSlot> getAllActiveSlots() {
        return slotRepository.findByActiveTrue();
    }

    // NEW: Get active slots for a specific owner
    public List<BookingSlot> getActiveSlotsForOwner(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));
        return slotRepository.findByOwnerAndActiveTrue(owner);
    }

    public List<Appointment> getStudentAppointments(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return appointmentRepository.findByStudent(student);
    }

    // deletion
    @Transactional
    public void deleteSlot(Long slotId, String ownerEmail) {
        BookingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
        
        if (!slot.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Only the owner can delete this slot.");
        }
        slotRepository.delete(slot);
    }

    @Transactional
    public void deleteAppointment(Long appointmentId, String studentEmail) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        if (!appt.getStudent().getEmail().equals(studentEmail)) {
            throw new IllegalStateException("Only the student can delete this appointment.");
        }
        
        if (appt.getStatus() == Appointment.Status.APPROVED) {
            BookingSlot slot = appt.getSlot();
            slot.setCurrentSelectionCount(slot.getCurrentSelectionCount() - 1);
            slotRepository.save(slot);
        }
        
        appointmentRepository.delete(appt);
    }
}