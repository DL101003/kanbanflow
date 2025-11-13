package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserDto {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private boolean active;
    private Instant createdAt;
}