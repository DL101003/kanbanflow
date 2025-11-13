package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserSummaryDto {
    private UUID id;
    private String username;
    private String fullName;
    private String avatarUrl;
}