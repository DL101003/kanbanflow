package com.project.kanbanflow.service;

import com.project.kanbanflow.dtos.CreateCardRequest;
import com.project.kanbanflow.dtos.CreateColumnRequest;
import com.project.kanbanflow.dtos.UpdateCardRequest;
import com.project.kanbanflow.dtos.UpdateColumnRequest;
import com.project.kanbanflow.entity.BoardColumn;
import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.entity.Project;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.exception.BadRequestException;
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

    public List<BoardColumn> getProjectColumns(UUID projectId) {
        projectService.getProject(projectId);
        return columnRepository.findByProjectIdOrderByPositionAsc(projectId);
    }

    // COLUMNS
    public BoardColumn createColumn(UUID projectId, CreateColumnRequest request) {
        Project project = projectService.getProject(projectId);
        Integer maxPosition = columnRepository.findMaxPositionByProjectId(projectId);

        BoardColumn column = BoardColumn.builder()
                .name(request.getName())
                .color(request.getColor())
                .position(maxPosition + 1)
                .project(project)
                .build();

        return columnRepository.save(column);
    }

    public BoardColumn updateColumn(UUID columnId, UpdateColumnRequest request) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new NotFoundException("Column not found"));

        column.setName(request.getName());
        column.setColor(request.getColor());
        column.setCardLimit(request.getCardLimit());

        return columnRepository.save(column);
    }

    public void deleteColumn(UUID columnId) {

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

    public List<Card> getColumnCards(UUID columnId) {
        return cardRepository.findByBoardColumnIdOrderByPositionAsc(columnId);
    }

    public Card getCard(UUID cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));
    }

    // CARDS
    public Card createCard(UUID columnId, CreateCardRequest request) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new NotFoundException("Column not found"));

        // Check card limit
        if (column.getCardLimit() == 0) {
            long currentCards = cardRepository.countByBoardColumnId(columnId);
            if (currentCards >= column.getCardLimit()) {
                throw new BadRequestException("Column card limit reached");
            }
        }

        Integer maxPosition = cardRepository.findMaxPositionByColumnId(columnId);
        User currentUser = userService.getCurrentUser();

        Card card = Card.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .position(maxPosition + 1)
                .boardColumn(column)
                .createdBy(currentUser)
                .build();

        return cardRepository.save(card);
    }

    public Card updateCard(UUID cardId, UpdateCardRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        card.setPriority(request.getPriority());
        card.setDueDate(request.getDueDate());
        card.setCoverColor(request.getCoverColor());

        if (request.getCompleted() != null) {
            card.setCompleted(request.getCompleted());
        }

        return cardRepository.save(card);
    }

    public Card moveCard(UUID cardId, UUID targetColumnId, Integer position) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        BoardColumn targetColumn = columnRepository.findById(targetColumnId)
                .orElseThrow(() -> new NotFoundException("Column not found"));

        // Check card limit of target column
        if (targetColumn.getCardLimit() == 0 && !targetColumnId.equals(card.getBoardColumn().getId())) {
            long currentCards = cardRepository.countByBoardColumnId(targetColumnId);
            if (currentCards >= targetColumn.getCardLimit()) {
                throw new BadRequestException("Target column card limit reached");
            }
        }

        // Remove from old position
        UUID oldColumnId = card.getBoardColumn().getId();
        Integer oldPosition = card.getPosition();

        // If moving within same column
        if (oldColumnId.equals(targetColumnId)) {
            if (position > oldPosition) {
                cardRepository.decrementPositionsBetween(oldColumnId, oldPosition, position);
            } else if (position < oldPosition) {
                cardRepository.incrementPositionsBetween(oldColumnId, position, oldPosition);
            }
        } else {
            // Moving to different column
            cardRepository.decrementPositionsAfter(oldColumnId, oldPosition);
            cardRepository.incrementPositionsFrom(targetColumnId, position);
        }

        card.setBoardColumn(targetColumn);
        card.setPosition(position);

        return cardRepository.save(card);
    }

    public Card assignCard(UUID cardId, UUID userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        if (userId != null) {
            User user = userService.getUserById(userId);
            card.setAssignee(user);
        } else {
            card.setAssignee(null); // Unassign
        }

        return cardRepository.save(card);
    }

    public void deleteCard(UUID cardId) {
    }
}