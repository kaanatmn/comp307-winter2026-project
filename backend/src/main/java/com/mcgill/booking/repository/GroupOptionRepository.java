package com.mcgill.booking.repository;

import com.mcgill.booking.entity.GroupOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupOptionRepository extends JpaRepository<GroupOption, Long> {
    List<GroupOption> findByPollId(Long pollId);
}