package com.project.kanbanflow.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateProjectRequest {
    @NotBlank
    private String name;
    private String description;
    private String color = "#3B82F6";
}