package com.mcgill.booking.service;

import com.mcgill.booking.entity.MeetingRequest;
import com.mcgill.booking.entity.TimeSlot;
import com.mcgill.booking.entity.User;
import com.mcgill.booking.repository.MeetingRequestRepository;
import com.mcgill.booking.repository.TimeSlotRepository;
import com.mcgill.booking.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MeetingRequestService {

    private final MeetingRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final TimeSlotRepository timeSlotRepository;

    public MeetingRequestService(MeetingRequestRepository requestRepository, UserRepository userRepository, TimeSlotRepository timeSlotRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    public MeetingRequest createRequest(String studentEmail, String ownerEmail, LocalDateTime requestedTime, String message) {
        User student = userRepository.findByEmail(studentEmail).orElseThrow(() -> new RuntimeException("Student not found"));
        User owner = userRepository.findByEmail(ownerEmail).orElseThrow(() -> new RuntimeException("Owner not found"));

        MeetingRequest request = new MeetingRequest();
        request.setStudent(student);
        request.setOwner(owner);
        request.setRequestedTime(requestedTime);
        request.setMessage(message);
        request.setStatus("PENDING");
        return requestRepository.save(request);
    }

    public List<MeetingRequest> getPendingRequests(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail).orElseThrow(() -> new RuntimeException("Owner not found"));
        return requestRepository.findByOwnerIdAndStatus(owner.getId(), "PENDING");
    }

    public void approveRequest(Long requestId, String ownerEmail) {
        MeetingRequest request = requestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
        if (!request.getOwner().getEmail().equals(ownerEmail)) throw new RuntimeException("Unauthorized");

        // Mark as approved
        request.setStatus("APPROVED");
        requestRepository.save(request);

        // Instantly generate the official booked TimeSlot for the dashboard
        TimeSlot slot = new TimeSlot();
        slot.setOwner(request.getOwner());
        slot.setStudent(request.getStudent());
        slot.setStartTime(request.getRequestedTime());
        slot.setEndTime(request.getRequestedTime().plusHours(1)); // Default 1 hour meeting
        slot.setActive(true);
        slot.setBooked(true);
        timeSlotRepository.save(slot);
    }

    public void declineRequest(Long requestId, String ownerEmail) {
        MeetingRequest request = requestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
        if (!request.getOwner().getEmail().equals(ownerEmail)) throw new RuntimeException("Unauthorized");
        
        request.setStatus("DECLINED");
        requestRepository.save(request);
    }
}