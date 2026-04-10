package com.mcgill.booking.controller;

import com.mcgill.booking.dto.SlotCreationDTO;
import com.mcgill.booking.entity.Appointment;
import com.mcgill.booking.entity.BookingSlot;
import com.mcgill.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ==========================================
    // OWNER ENDPOINTS
    // ==========================================

    @PostMapping("/slots")
    public ResponseEntity<?> createSlot(@RequestBody SlotCreationDTO dto) {
        try {
            List<BookingSlot> slots = bookingService.createSlot(
                dto.getOwnerEmail(), dto.getTitle(), dto.getStartTime(), dto.getEndTime(), dto.getType(), dto.getRecurringWeeks()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/slots/{slotId}/activate")
    public ResponseEntity<?> activateSlot(@PathVariable Long slotId, @RequestParam String ownerEmail) {
        try {
            BookingSlot activeSlot = bookingService.activateSlot(slotId, ownerEmail);
            return ResponseEntity.ok(activeSlot);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/owner/{ownerEmail}/slots")
    public ResponseEntity<List<BookingSlot>> getOwnerSlots(@PathVariable String ownerEmail) {
        return ResponseEntity.ok(bookingService.getOwnerSlots(ownerEmail));
    }

    // NEW: Get only active slots for a specific owner
    @GetMapping("/owner/{ownerEmail}/slots/active")
    public ResponseEntity<List<BookingSlot>> getActiveSlotsForOwner(@PathVariable String ownerEmail) {
        return ResponseEntity.ok(bookingService.getActiveSlotsForOwner(ownerEmail));
    }

    @PatchMapping("/appointments/{appointmentId}/respond")
    public ResponseEntity<?> respondToRequest(@PathVariable Long appointmentId, @RequestParam String ownerEmail, @RequestParam boolean isApproved) {
        try {
            Appointment appt = bookingService.respondToRequest(appointmentId, ownerEmail, isApproved);
            return ResponseEntity.ok(appt);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // STUDENT ENDPOINTS
    // ==========================================

    @GetMapping("/slots/active")
    public ResponseEntity<List<BookingSlot>> getActiveSlots() {
        return ResponseEntity.ok(bookingService.getAllActiveSlots());
    }

    @PostMapping("/slots/{slotId}/book")
    public ResponseEntity<?> bookSlot(@PathVariable Long slotId, @RequestParam String studentEmail) {
        try {
            Appointment appointment = bookingService.bookSlot(slotId, studentEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentEmail}/appointments")
    public ResponseEntity<List<Appointment>> getStudentAppointments(@PathVariable String studentEmail) {
        return ResponseEntity.ok(bookingService.getStudentAppointments(studentEmail));
    }

    // ==========================================
    // DELETE ENDPOINTS
    // ==========================================

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long slotId, @RequestParam String ownerEmail) {
        try {
            bookingService.deleteSlot(slotId, ownerEmail);
            return ResponseEntity.ok(Map.of("message", "Slot deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long appointmentId, @RequestParam String studentEmail) {
        try {
            bookingService.deleteAppointment(appointmentId, studentEmail);
            return ResponseEntity.ok(Map.of("message", "Appointment canceled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // BONUS: EXPORT TO CALENDAR (.ics format)
    // ==========================================

    @GetMapping(value = "/appointments/{appointmentId}/export", produces = "text/calendar")
    public ResponseEntity<String> exportToCalendar(@PathVariable Long appointmentId) {
        try {
            Appointment appt = bookingService.getStudentAppointments(null).stream() 
                    .filter(a -> a.getId().equals(appointmentId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            
            BookingSlot slot = appt.getSlot();
            
            String icsContent = "BEGIN:VCALENDAR\n" +
                    "VERSION:2.0\n" +
                    "BEGIN:VEVENT\n" +
                    "SUMMARY:" + slot.getTitle() + "\n" +
                    "DTSTART:" + slot.getStartTime().toString().replace("-", "").replace(":", "") + "Z\n" +
                    "DTEND:" + slot.getEndTime().toString().replace("-", "").replace(":", "") + "Z\n" +
                    "DESCRIPTION:COMP 307 Appointment with " + slot.getOwner().getName() + "\n" +
                    "END:VEVENT\n" +
                    "END:VCALENDAR";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=appointment.ics")
                    .body(icsContent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating calendar file.");
        }
    }
}