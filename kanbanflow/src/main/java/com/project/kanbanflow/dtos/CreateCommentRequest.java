package com.project.kanbanflow.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCommentRequest {
    @NotBlank
    @Size(min = 1, max = 1000)
    private String content;
}