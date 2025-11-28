package com.project.kanbanflow.controller;

import com.project.kanbanflow.dtos.ChangePasswordRequest;
import com.project.kanbanflow.dtos.UpdateProfileRequest;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserDto> getCurrentUser() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(request);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().build();
    }
}