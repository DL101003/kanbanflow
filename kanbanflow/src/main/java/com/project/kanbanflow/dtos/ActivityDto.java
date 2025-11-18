package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ActivityDto {
    private UUID id;
    private UserSummaryDto user;
    private String action;
    private String entityType;
    private UUID entityId;
    private String details;
    private Instant createdAt;
}