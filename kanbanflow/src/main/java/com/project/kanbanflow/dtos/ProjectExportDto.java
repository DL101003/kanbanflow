package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ProjectExportDto {
    private String name;
    private String description;
    private List<BoardColumnExportDto> columns;
    private Instant exportedAt;
}