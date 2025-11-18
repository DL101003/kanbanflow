package com.project.kanbanflow.service;

import com.project.kanbanflow.entity.Activity;
import com.project.kanbanflow.entity.Project;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.repository.ActivityRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserService userService;

    public void logActivity(Project project, String action, String entityType, UUID entityId, String details) {
        User currentUser = userService.getCurrentUser();

        Activity activity = Activity.builder()
                .project(project)
                .user(currentUser)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();

        activityRepository.save(activity);
    }

    public Page<Activity> getProjectActivities(UUID projectId, Pageable pageable) {
        return activityRepository.findByProjectIdOrderByCreatedAtDesc(projectId, pageable);
    }

    public List<Activity> getCardActivities(UUID cardId) {
        return activityRepository.findByEntityIdAndEntityTypeOrderByCreatedAtDesc(cardId, "CARD");
    }
}