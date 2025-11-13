package com.project.kanbanflow.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MoveRequest {
    @NotNull
    private int position;
}