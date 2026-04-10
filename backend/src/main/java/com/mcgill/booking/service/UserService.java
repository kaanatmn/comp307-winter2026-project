package com.mcgill.booking.service;

import com.mcgill.booking.dto.UserRegistrationDTO;
import com.mcgill.booking.entity.User;
import com.mcgill.booking.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(UserRegistrationDTO dto) {
        String rawEmail = dto.getEmail().trim().toLowerCase();

        // 1. Enforce Domain Logic (McGill specific rule)
        User.Role assignedRole;
        if (rawEmail.endsWith("@mcgill.ca")) {
            assignedRole = User.Role.OWNER;
        } else if (rawEmail.endsWith("@mail.mcgill.ca")) {
            assignedRole = User.Role.USER;
        } else {
            throw new IllegalArgumentException("Registration denied: Only McGill emails are permitted.");
        }

        // 2. Prevent Duplicate Accounts
        if (userRepository.findByEmail(rawEmail).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // 3. Create and Save Entity
        User newUser = new User();
        newUser.setName(dto.getName());
        newUser.setEmail(rawEmail);
        // Hash the password before saving to the DB for security points
        newUser.setPassword(passwordEncoder.encode(dto.getPassword())); 
        newUser.setRole(assignedRole);

        return userRepository.save(newUser);
    }
}