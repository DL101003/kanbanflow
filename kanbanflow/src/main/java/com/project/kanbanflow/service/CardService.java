package com.project.kanbanflow.service;

import com.project.kanbanflow.dtos.CreateCardRequest;
import com.project.kanbanflow.dtos.UpdateCardRequest;
import com.project.kanbanflow.entity.BoardColumn;
import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.entity.enums.Priority;
import com.project.kanbanflow.exception.BadRequestException;
import com.project.kanbanflow.exception.ForbiddenException;
import com.project.kanbanflow.exception.NotFoundException;
import com.project.kanbanflow.repository.BoardColumnRepository;
import com.project.kanbanflow.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CardService {
    private final CardRepository cardRepository;
    private final ActivityService activityService;
    private final BoardColumnRepository columnRepository;
    private final UserService userService;
    private final ProjectService projectService;


    private void checkEditPermission(UUID projectId) {
        User currentUser = userService.getCurrentUser();
        if (!projectService.canUserEditProject(projectId, currentUser.getId())) {
            throw new ForbiddenException("You don't have permission to edit this project");
        }
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

        checkEditPermission(column.getProject().getId());

        // Check card limit
        if (column.getCardLimit() != 0) {
            List<Card> existingCards = cardRepository.findByBoardColumnIdOrderByPositionAsc(columnId);
            int currentCards = existingCards.size();

            if (currentCards >= column.getCardLimit()) {
                throw new BadRequestException(
                        String.format("Column card limit reached (%d/%d)",
                                currentCards, column.getCardLimit())
                );
            }
        }

        Integer maxPosition = cardRepository.findMaxPositionByColumnId(columnId);
        User currentUser = userService.getCurrentUser();

        Card card = Card.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(Priority.valueOf(request.getPriority()))
                .dueDate(request.getDueDate())
                .position(maxPosition + 1)
                .boardColumn(column)
                .createdBy(currentUser)
                .build();

        Card savedCard = cardRepository.save(card);

        // Log activity
        activityService.logActivity(
                column.getProject(),
                "CREATED",
                "CARD",
                savedCard.getId(),
                String.format("Created card '%s' in column '%s'",
                        savedCard.getTitle(), column.getName())
        );

        return savedCard;
    }

    public Card updateCard(UUID cardId, UpdateCardRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        checkEditPermission(card.getBoardColumn().getProject().getId());

        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        card.setPriority(request.getPriority());
        card.setDueDate(request.getDueDate());
        card.setCoverColor(request.getCoverColor());

        if (request.getCompleted() != null) {
            card.setCompleted(request.getCompleted());
        }

        Card updatedCard = cardRepository.save(card);

        // Log activity
        activityService.logActivity(
                card.getBoardColumn().getProject(),
                "UPDATED",
                "CARD",
                cardId,
                String.format("Updated card '%s'", card.getTitle())
        );

        return updatedCard;
    }

    public Card moveCard(UUID cardId, UUID targetColumnId, Integer position) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        BoardColumn targetColumn = columnRepository.findById(targetColumnId)
                .orElseThrow(() -> new NotFoundException("Column not found"));

        // Check card limit PROPERLY
        if (targetColumn.getCardLimit() != 0 &&
                !targetColumnId.equals(card.getBoardColumn().getId())) {

            // Count cards in target column
            List<Card> cardsInTargetColumn = cardRepository
                    .findByBoardColumnIdOrderByPositionAsc(targetColumnId);

            int currentCardCount = cardsInTargetColumn.size();

            if (currentCardCount >= targetColumn.getCardLimit()) {
                throw new BadRequestException(
                        String.format("Column '%s' has reached its card limit (%d/%d)",
                                targetColumn.getName(),
                                currentCardCount,
                                targetColumn.getCardLimit())
                );
            }
        }

        // Handle position updates
        UUID oldColumnId = card.getBoardColumn().getId();
        int oldPosition = card.getPosition();

        // If moving within same column
        if (oldColumnId.equals(targetColumnId)) {
            if (!position.equals(oldPosition)) {
                // Reorder within column
                if (position > oldPosition) {
                    // Moving down
                    cardRepository.decrementPositionsBetween(
                            oldColumnId, oldPosition + 1, position
                    );
                } else {
                    // Moving up
                    cardRepository.incrementPositionsBetween(
                            oldColumnId, position, oldPosition - 1
                    );
                }
            }
        } else {
            // Moving to different column
            // Update positions in old column
            cardRepository.decrementPositionsAfter(oldColumnId, oldPosition);

            // Make space in new column
            cardRepository.incrementPositionsFrom(targetColumnId, position);
        }

        // Update card
        card.setBoardColumn(targetColumn);
        card.setPosition(position);

        Card movedCard = cardRepository.save(card);

        // Log activity
        activityService.logActivity(
                card.getBoardColumn().getProject(),
                "MOVED",
                "CARD",
                cardId,
                String.format("Moved card '%s' to column '%s'",
                        card.getTitle(), targetColumn.getName())
        );

        return movedCard;
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
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        System.out.println("Check");

        checkEditPermission(card.getBoardColumn().getProject().getId());

        UUID columnId = card.getBoardColumn().getId();
        Integer deletedPosition = card.getPosition();

        // Delete the card (will trigger soft delete)
        cardRepository.delete(card);

        // Reorder remaining cards in the column
        cardRepository.decrementPositionsAfter(columnId, deletedPosition);

        // Log activity
        activityService.logActivity(
                card.getBoardColumn().getProject(),
                "DELETED",
                "CARD",
                cardId,
                String.format("Deleted card: %s", card.getTitle())
        );
    }
}
