package com.project.kanbanflow.dtos;

import com.project.kanbanflow.entity.enums.Priority;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class SearchCriteria {
    private String query;
    private Priority priority;
    private UUID assigneeId;
    private Boolean completed;
    private LocalDate dueDateFrom;
    private LocalDate dueDateTo;
}