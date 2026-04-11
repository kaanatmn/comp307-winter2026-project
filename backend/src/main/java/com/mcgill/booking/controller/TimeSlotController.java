package com.mcgill.booking.controller;

import com.mcgill.booking.entity.TimeSlot;
import com.mcgill.booking.service.TimeSlotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
            // Spring Security gives us the email of the currently logged-in user automatically!
            String email = authentication.getName(); 
            LocalDateTime start = LocalDateTime.parse(request.get("startTime"));
            LocalDateTime end = LocalDateTime.parse(request.get("endTime"));

            TimeSlot savedSlot = timeSlotService.createSlot(email, start, end);
            return ResponseEntity.ok(savedSlot);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create slot: " + e.getMessage());
        }
    }

    @GetMapping("/my-slots")
    public ResponseEntity<List<TimeSlot>> getMySlots(Authentication authentication) {
        String email = authentication.getName();
        List<TimeSlot> slots = timeSlotService.getSlotsByOwner(email);
        return ResponseEntity.ok(slots);
    }
}