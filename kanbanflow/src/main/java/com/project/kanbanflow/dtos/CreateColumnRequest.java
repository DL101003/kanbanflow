package com.project.kanbanflow.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateColumnRequest {
    @NotBlank
    private String name;
    private String color;
    private int cardLimit;
}