package com.project.kanbanflow.exception;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
public class ErrorResponse {
    private Integer status;
    private String message;
    private Map<String, String> errors;
    private Instant timestamp;
}