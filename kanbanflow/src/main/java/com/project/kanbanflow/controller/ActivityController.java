package com.project.kanbanflow.controller;

import com.project.kanbanflow.dtos.ActivityDto;
import com.project.kanbanflow.entity.Activity;
import com.project.kanbanflow.mapper.ActivityMapper;
import com.project.kanbanflow.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Activities", description = "Activity log APIs")
public class ActivityController {

    private final ActivityService activityService;
    private final ActivityMapper activityMapper;

    @GetMapping("/projects/{projectId}/activities")
    @Operation(summary = "Get project activities")
    public ResponseEntity<Page<ActivityDto>> getProjectActivities(
            @PathVariable UUID projectId,
            @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
        Page<Activity> activities = activityService.getProjectActivities(projectId, pageable);
        return ResponseEntity.ok(activities.map(activityMapper::toDto));
    }

    @GetMapping("/cards/{cardId}/activities")
    @Operation(summary = "Get card activities")
    public ResponseEntity<List<ActivityDto>> getCardActivities(@PathVariable UUID cardId) {
        List<Activity> activities = activityService.getCardActivities(cardId);
        return ResponseEntity.ok(activities.stream()
                .map(activityMapper::toDto)
                .toList());
    }
}