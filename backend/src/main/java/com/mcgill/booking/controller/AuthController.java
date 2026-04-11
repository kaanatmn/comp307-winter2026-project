package com.mcgill.booking.controller;

import com.mcgill.booking.dto.LoginDTO;
import com.mcgill.booking.dto.UserRegistrationDTO;
import com.mcgill.booking.entity.User;
import com.mcgill.booking.repository.UserRepository;
import com.mcgill.booking.security.JwtUtil;
import com.mcgill.booking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, UserRepository userRepository, 
                          PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            // FIX: Unpack the DTO and map it to a real User entity before passing to the service
            User newUser = new User();
            newUser.setName(dto.getName());
            newUser.setEmail(dto.getEmail());
            newUser.setPassword(dto.getPassword());

            User registeredUser = userService.registerUser(newUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("message", "User registered successfully", "email", registeredUser.getEmail())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto) {
        String rawEmail = dto.getEmail().trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(rawEmail);

        // 1. Check if user exists
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        User user = userOptional.get();

        // 2. Verify Password
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        // 3. Generate Token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // 4. FIX: Return the Token and a grouped User object exactly as React's AuthContext expects it
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("role", user.getRole().name()); // Converts Enum to safe String
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        
        response.put("user", userMap);

        return ResponseEntity.ok(response);
    }
}