package com.project.kanbanflow.dtos;

import com.project.kanbanflow.entity.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AddMemberRequest {
    @NotNull
    private UUID userId;
    @NotNull
    private ProjectRole role;
}
