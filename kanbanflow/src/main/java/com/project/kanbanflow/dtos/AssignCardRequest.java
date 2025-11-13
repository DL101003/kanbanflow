package com.project.kanbanflow.dtos;

import lombok.Data;

import java.util.UUID;

@Data
public class AssignCardRequest {
    private UUID userId;
}