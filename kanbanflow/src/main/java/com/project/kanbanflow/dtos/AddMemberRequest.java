package com.project.kanbanflow.dtos;

import com.project.kanbanflow.entity.enums.ProjectRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddMemberRequest {
    @NotBlank
    @Email
    private String email; // Email, không phải userId
    @NotNull
    private ProjectRole role;
}
