package com.mcgill.booking.controller;

import com.mcgill.booking.entity.User;
import com.mcgill.booking.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/owners")
    public ResponseEntity<List<User>> getAllOwners() {
        // fetch all users and filter for OWNER role
        List<User> owners = ((List<User>) userRepository.findAll()).stream()
                .filter(user -> user.getRole() == User.Role.OWNER)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(owners);
    }
}