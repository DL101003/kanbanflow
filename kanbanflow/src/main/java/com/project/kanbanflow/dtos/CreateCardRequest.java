package com.project.kanbanflow.dtos;

import com.project.kanbanflow.entity.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateCardRequest {
    @NotBlank
    private String title;
    private String description;
    private Priority priority = Priority.MEDIUM;
    private LocalDate dueDate;
}