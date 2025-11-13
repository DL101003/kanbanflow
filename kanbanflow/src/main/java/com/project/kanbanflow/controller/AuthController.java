package com.project.kanbanflow.controller;

import com.project.kanbanflow.dtos.AuthResponse;
import com.project.kanbanflow.dtos.LoginRequest;
import com.project.kanbanflow.dtos.RegisterRequest;
import com.project.kanbanflow.dtos.UserDto;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.mapper.UserMapper;
import com.project.kanbanflow.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth management APIs")
public class AuthController {

    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info")
    public ResponseEntity<UserDto> getCurrentUser() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(userMapper.toDto(user));
    }
}