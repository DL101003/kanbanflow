package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectStatsDto {
    private int totalCards;
    private int completedCards;
    private int overdueCards;
    private int totalColumns;
}