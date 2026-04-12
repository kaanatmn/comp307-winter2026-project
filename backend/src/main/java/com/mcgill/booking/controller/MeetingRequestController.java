package com.mcgill.booking.controller;

import com.mcgill.booking.service.MeetingRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requests")
public class MeetingRequestController {

    private final MeetingRequestService requestService;

    public MeetingRequestController(MeetingRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRequest(Authentication authentication, @RequestBody Map<String, String> payload) {
        try {
            requestService.createRequest(
                    authentication.getName(),
                    payload.get("ownerEmail"),
                    LocalDateTime.parse(payload.get("requestedTime")),
                    payload.get("message")
            );
            return ResponseEntity.ok(Map.of("message", "Request sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests(Authentication authentication) {
        var requests = requestService.getPendingRequests(authentication.getName());
        var cleanData = requests.stream().map(r -> Map.of(
                "id", r.getId(),
                "studentName", r.getStudent().getName(),
                "studentEmail", r.getStudent().getEmail(),
                "requestedTime", r.getRequestedTime().toString(),
                "message", r.getMessage()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(cleanData);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(Authentication authentication, @PathVariable Long id) {
        try {
            requestService.approveRequest(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<?> decline(Authentication authentication, @PathVariable Long id) {
        try {
            requestService.declineRequest(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Declined successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}