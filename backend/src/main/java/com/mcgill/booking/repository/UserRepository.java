package com.mcgill.booking.repository;

import com.mcgill.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // For authentication later
    Optional<User> findByEmail(String email);
    
    // Check if user already exists during registration
    boolean existsByEmail(String email);
}