package com.project.kanbanflow.controller;

import com.project.kanbanflow.dtos.ProjectExportDto;
import com.project.kanbanflow.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Export APIs")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/projects/{projectId}/csv")
    @Operation(summary = "Export project to CSV")
    public ResponseEntity<Resource> exportProjectToCSV(@PathVariable UUID projectId) {
        byte[] csvData = exportService.exportProjectToCSV(projectId);

        ByteArrayResource resource = new ByteArrayResource(csvData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=project-export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(csvData.length)
                .body(resource);
    }

    @GetMapping("/projects/{projectId}/json")
    @Operation(summary = "Export project to JSON")
    public ResponseEntity<ProjectExportDto> exportProjectToJSON(@PathVariable UUID projectId) {
        return ResponseEntity.ok(exportService.exportProjectToJSON(projectId));
    }
}