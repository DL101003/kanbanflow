package com.project.kanbanflow.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String username; // email or username
    @NotBlank
    private String password;
}