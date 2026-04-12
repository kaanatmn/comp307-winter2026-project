package com.mcgill.booking.repository;

import com.mcgill.booking.entity.MeetingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRequestRepository extends JpaRepository<MeetingRequest, Long> {
    List<MeetingRequest> findByOwnerIdAndStatus(Long ownerId, String status);
}
