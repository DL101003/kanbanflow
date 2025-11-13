package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ProjectMemberDto {
    private UserSummaryDto user;
    private String role;
    private Instant joinedAt;
}