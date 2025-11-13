package com.project.kanbanflow.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProjectRequest {
    @NotBlank
    private String name;
    private String description;
    private String color;
}