package com.mcgill.booking.controller;

import com.mcgill.booking.entity.TimeSlot;
import com.mcgill.booking.service.TimeSlotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    public TimeSlotController(TimeSlotService timeSlotService) {
        this.timeSlotService = timeSlotService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSlot(Authentication authentication, @RequestBody Map<String, String> request) {
        try {
            String email = authentication.getName(); 
            LocalDateTime start = LocalDateTime.parse(request.get("startTime"));
            LocalDateTime end = LocalDateTime.parse(request.get("endTime"));
            timeSlotService.createSlot(email, start, end);
            return ResponseEntity.ok(Map.of("message", "Created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-slots")
    public ResponseEntity<?> getMySlots(Authentication authentication) {
        String email = authentication.getName();
        List<TimeSlot> slots = timeSlotService.getSlotsByOwner(email);
        
        List<Map<String, Object>> cleanSlots = slots.stream().map(slot -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", slot.getId());
            map.put("startTime", slot.getStartTime().toString());
            map.put("endTime", slot.getEndTime().toString());
            map.put("isActive", slot.isActive());
            map.put("isBooked", slot.isBooked());
            
            if (slot.getStudent() != null) {
                map.put("studentName", slot.getStudent().getName());
                map.put("studentEmail", slot.getStudent().getEmail());
            }
            return map;
        }).toList();
        
        return ResponseEntity.ok(cleanSlots);
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableSlots() {
        List<TimeSlot> availableSlots = timeSlotService.getAllAvailableSlots();
        
        List<Map<String, Object>> cleanSlots = availableSlots.stream().map(slot -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", slot.getId());
            map.put("startTime", slot.getStartTime().toString());
            map.put("endTime", slot.getEndTime().toString());
            map.put("profName", slot.getOwner().getName());
            map.put("profEmail", slot.getOwner().getEmail());
            return map;
        }).toList();
        
        return ResponseEntity.ok(cleanSlots);
    }

    // NEW: Get available slots for ONE specific professor via their Invitation Link
    @GetMapping("/available/{email}")
    public ResponseEntity<?> getProfessorSlots(@PathVariable String email) {
        List<TimeSlot> availableSlots = timeSlotService.getAllAvailableSlots();
        
        List<Map<String, Object>> cleanSlots = availableSlots.stream()
            // Filter down to just the requested professor
            .filter(slot -> slot.getOwner().getEmail().equalsIgnoreCase(email))
            .map(slot -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", slot.getId());
                map.put("startTime", slot.getStartTime().toString());
                map.put("endTime", slot.getEndTime().toString());
                map.put("profName", slot.getOwner().getName());
                map.put("profEmail", slot.getOwner().getEmail());
                return map;
            }).toList();
        
        return ResponseEntity.ok(cleanSlots);
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<?> getMyAppointments(Authentication authentication) {
        String email = authentication.getName();
        List<TimeSlot> mySlots = timeSlotService.getSlotsByStudent(email);
        
        List<Map<String, Object>> cleanSlots = mySlots.stream().map(slot -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", slot.getId());
            map.put("startTime", slot.getStartTime().toString());
            map.put("endTime", slot.getEndTime().toString());
            map.put("profName", slot.getOwner().getName());
            map.put("profEmail", slot.getOwner().getEmail());
            return map;
        }).toList();
        
        return ResponseEntity.ok(cleanSlots);
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateSlot(@PathVariable Long id, Authentication authentication) {
        try {
            timeSlotService.activateSlot(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Activated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateSlot(@PathVariable Long id, Authentication authentication) {
        try {
            timeSlotService.deactivateSlot(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Deactivated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id, Authentication authentication) {
        try {
            timeSlotService.deleteSlot(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<?> bookSlot(@PathVariable Long id, Authentication authentication) {
        try {
            timeSlotService.bookSlot(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Booked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, Authentication authentication) {
        try {
            timeSlotService.cancelBooking(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}