package com.project.kanbanflow.service;

import com.project.kanbanflow.dtos.CreateColumnRequest;
import com.project.kanbanflow.dtos.UpdateColumnRequest;
import com.project.kanbanflow.entity.BoardColumn;
import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.entity.Project;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.exception.DuplicateException;
import com.project.kanbanflow.exception.ForbiddenException;
import com.project.kanbanflow.exception.NotFoundException;
import com.project.kanbanflow.repository.BoardColumnRepository;
import com.project.kanbanflow.repository.CardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final BoardColumnRepository columnRepository;
    private final CardRepository cardRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final ActivityService activityService;



    public boolean canUserEditColumn(UUID columnId, UUID userId) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new NotFoundException("Column not found"));
        return projectService.canUserEditProject(column.getProject().getId(), userId);
    }

    public boolean canUserEditCard(UUID cardId, UUID userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));
        return projectService.canUserEditProject(
                card.getBoardColumn().getProject().getId(), userId);
    }

    public List<BoardColumn> getProjectColumns(UUID projectId) {
        projectService.getProject(projectId);
        return columnRepository.findAllWithCardsByProjectId(projectId);
    }

    // COLUMNS
    @Transactional
    public BoardColumn createColumn(UUID projectId, CreateColumnRequest request) {
        Project project = projectService.getProject(projectId);
        User currentUser = userService.getCurrentUser();

        // Check permission
        if (!projectService.canUserEditProject(projectId, currentUser.getId())) {
            throw new ForbiddenException("You don't have permission to create columns");
        }

        // Get all active columns
        List<BoardColumn> activeColumns = columnRepository
                .findByProjectIdOrderByPositionAsc(projectId);

        // Check for duplicate name
        boolean nameExists = activeColumns.stream()
                .anyMatch(col -> col.getName().equalsIgnoreCase(request.getName()));

        if (nameExists) {
            throw new DuplicateException(
                    String.format("Column '%s' already exists", request.getName())
            );
        }

        // Calculate next position
        int newPosition = activeColumns.isEmpty() ? 0 :
                activeColumns.getLast().getPosition() + 1;

        BoardColumn column = BoardColumn.builder()
                .name(request.getName())
                .color(request.getColor())
                .cardLimit(request.getCardLimit())
                .position(newPosition)
                .project(project)
                .build();

        BoardColumn savedColumn = columnRepository.save(column);

        // Log activity
        activityService.logActivity(
                project,
                "CREATED",
                "COLUMN",
                savedColumn.getId(),
                String.format("Created column '%s'", savedColumn.getName())
        );

        return savedColumn;
    }

    public BoardColumn updateColumn(UUID columnId, UpdateColumnRequest request) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new NotFoundException("Column not found"));

        column.setName(request.getName());
        column.setColor(request.getColor());
        column.setCardLimit(request.getCardLimit());

        return columnRepository.save(column);
    }

    @Transactional
    public void deleteColumn(UUID columnId) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new NotFoundException("Column not found"));

        User currentUser = userService.getCurrentUser();
        if (!projectService.canUserEditProject(column.getProject().getId(), currentUser.getId())) {
            throw new ForbiddenException("You don't have permission to delete columns");
        }

        columnRepository.delete(column);

        activityService.logActivity(
                column.getProject(),
                "DELETED",
                "COLUMN",
                columnId,
                String.format("Deleted column '%s'", column.getName())
        );

    }

    public void moveColumn(UUID columnId, Integer newPosition) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new NotFoundException("Column not found"));

        Integer oldPosition = column.getPosition();
        if (oldPosition.equals(newPosition)) return;

        UUID projectId = column.getProject().getId();

        if (newPosition > oldPosition) {
            // Moving right: shift columns left
            columnRepository.decrementPositionsAfter(projectId, oldPosition);
        } else {
            // Moving left: shift columns right
            columnRepository.incrementPositionsFrom(projectId, newPosition);
        }

        column.setPosition(newPosition);
        columnRepository.save(column);
    }


}