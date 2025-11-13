package com.project.kanbanflow.controller;

import com.project.kanbanflow.dtos.*;
import com.project.kanbanflow.entity.Project;
import com.project.kanbanflow.mapper.ProjectMapper;
import com.project.kanbanflow.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management APIs")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @GetMapping
    @Operation(summary = "Get all user projects")
    public ResponseEntity<Page<ProjectDto>> getUserProjects(
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {
        Page<Project> projects = projectService.getUserProjects(pageable);
        return ResponseEntity.ok(projects.map(projectMapper::toDto));
    }

    @PostMapping
    @Operation(summary = "Create new project")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request) {
        Project project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(projectMapper.toDto(project));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project details")
    public ResponseEntity<ProjectDetailDto> getProject(@PathVariable UUID projectId) {
        Project project = projectService.getProject(projectId);
        return ResponseEntity.ok(projectMapper.toDetailDto(project));
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update project")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable UUID projectId,
            @Valid @RequestBody UpdateProjectRequest request) {
        Project project = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(projectMapper.toDto(project));
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "Delete project")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable UUID projectId) {
        projectService.deleteProject(projectId);
    }

    @PostMapping("/{projectId}/favorite")
    @Operation(summary = "Toggle favorite project")
    public ResponseEntity<Void> toggleFavorite(@PathVariable UUID projectId) {
        projectService.toggleFavorite(projectId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{projectId}/members")
    @Operation(summary = "Get project members")
    public ResponseEntity<List<ProjectMemberDto>> getProjectMembers(@PathVariable UUID projectId) {
        return ResponseEntity.ok(projectService.getProjectMembers(projectId));
    }

    @PostMapping("/{projectId}/members")
    @Operation(summary = "Add member to project")
    public ResponseEntity<Void> addMember(
            @PathVariable UUID projectId,
            @Valid @RequestBody AddMemberRequest request) {
        projectService.addMember(projectId, request.getUserId(), request.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{projectId}/members/{userId}")
    @Operation(summary = "Update member role")
    public ResponseEntity<Void> updateMemberRole(
            @PathVariable UUID projectId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        projectService.updateMemberRole(projectId, userId, request.getRole());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @Operation(summary = "Remove member from project")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(
            @PathVariable UUID projectId,
            @PathVariable UUID userId) {
        projectService.removeMember(projectId, userId);
    }
}