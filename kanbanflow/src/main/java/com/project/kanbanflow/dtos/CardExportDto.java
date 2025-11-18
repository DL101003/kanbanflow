package com.project.kanbanflow.dtos;

import com.project.kanbanflow.entity.enums.Priority;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CardExportDto {
    private String title;
    private String description;
    private Priority priority;
    private boolean completed;
    private LocalDate dueDate;
    private String assignee;
}