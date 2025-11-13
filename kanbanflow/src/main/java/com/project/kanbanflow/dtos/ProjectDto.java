package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ProjectDto {
    private UUID id;
    private String name;
    private String description;
    private String color;
    private boolean favorite;
    private Instant createdAt;
    private UserSummaryDto owner;
}