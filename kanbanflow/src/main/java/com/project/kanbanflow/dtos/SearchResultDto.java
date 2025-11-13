package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class SearchResultDto {
    private List<CardDto> cards;
    private int totalResults;
    private Map<String, Integer> facets; // e.g., priority counts
}