package com.project.kanbanflow.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class BoardColumnDto {
    private UUID id;
    private String name;
    private String color;
    private int position;
    private int cardLimit;
    private int cardCount;
}
