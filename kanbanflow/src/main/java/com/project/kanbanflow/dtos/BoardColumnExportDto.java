package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BoardColumnExportDto {
    private String name;
    private Integer position;
    private List<CardExportDto> cards;
}