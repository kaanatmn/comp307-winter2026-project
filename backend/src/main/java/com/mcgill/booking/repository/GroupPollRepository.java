package com.mcgill.booking.repository;

import com.mcgill.booking.entity.GroupPoll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupPollRepository extends JpaRepository<GroupPoll, Long> {
    List<GroupPoll> findByOwnerId(Long ownerId);
    List<GroupPoll> findByActiveTrue();
}