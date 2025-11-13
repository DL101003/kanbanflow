package com.project.kanbanflow.dtos;

import com.project.kanbanflow.entity.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CardDto {
    private UUID id;
    private String title;
    private String description;
    private Priority priority;
    private LocalDate dueDate;
    private String coverColor;
    private boolean completed;
    private int position;
    private UserSummaryDto assignee;
    private int commentCount;
    private boolean overdue;
}