package com.project.kanbanflow.dtos;

import com.project.kanbanflow.entity.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMemberRoleRequest {
    @NotNull
    private ProjectRole role;
}