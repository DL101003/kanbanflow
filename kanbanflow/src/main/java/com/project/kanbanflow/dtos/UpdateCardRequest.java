package com.project.kanbanflow.dtos;

import com.project.kanbanflow.entity.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateCardRequest {
    @NotBlank
    private String title;
    private String description;
    private Priority priority;
    private LocalDate dueDate;
    private String coverColor;
    private Boolean completed;
}