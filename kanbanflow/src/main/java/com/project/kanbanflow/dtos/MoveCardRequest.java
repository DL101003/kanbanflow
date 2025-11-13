package com.project.kanbanflow.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class MoveCardRequest {
    @NotNull
    private UUID columnId;
    @NotNull
    private int position;
}
