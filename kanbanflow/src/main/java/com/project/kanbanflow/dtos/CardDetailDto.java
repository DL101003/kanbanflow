package com.project.kanbanflow.dtos;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CardDetailDto extends CardDto {
    private List<CommentDto> recentComments;
    private UserSummaryDto createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}