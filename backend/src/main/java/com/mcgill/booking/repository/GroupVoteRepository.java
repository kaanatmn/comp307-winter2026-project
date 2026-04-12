package com.mcgill.booking.repository;

import com.mcgill.booking.entity.GroupVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupVoteRepository extends JpaRepository<GroupVote, Long> {
    List<GroupVote> findByOptionId(Long optionId);
    boolean existsByOptionIdAndStudentId(Long optionId, Long studentId);
}