package com.project.kanbanflow.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateCardRequest {
    @NotBlank
    private String title;
    private String description;
    private String priority;
    private LocalDate dueDate;
}