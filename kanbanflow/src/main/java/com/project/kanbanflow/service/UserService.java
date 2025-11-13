package com.project.kanbanflow.service;

import com.project.kanbanflow.dtos.AuthResponse;
import com.project.kanbanflow.dtos.LoginRequest;
import com.project.kanbanflow.dtos.RegisterRequest;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.exception.DuplicateException;
import com.project.kanbanflow.exception.NotFoundException;
import com.project.kanbanflow.exception.UnauthorizedException;
import com.project.kanbanflow.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        // Check existing
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateException("Username already exists");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();

        user = userRepository.save(user);

        // Generate token
        String token = jwtService.generateToken(user.getUsername(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailOrUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}