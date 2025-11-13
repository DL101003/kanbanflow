package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class CommentDto {
    private UUID id;
    private String content;
    private boolean edited;
    private UserSummaryDto author;
    private Instant createdAt;
    private Instant updatedAt;
}
