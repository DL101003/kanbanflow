package com.project.kanbanflow.controller;

import com.project.kanbanflow.dtos.*;
import com.project.kanbanflow.entity.BoardColumn;
import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.mapper.BoardMapper;
import com.project.kanbanflow.mapper.CardMapper;
import com.project.kanbanflow.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Board", description = "Kanban board management APIs")
public class BoardController {

    private final BoardService boardService;
    private final BoardMapper boardMapper;
    private final CardMapper cardMapper;

    @GetMapping("/projects/{projectId}/columns")
    @Operation(summary = "Get all columns of a project")
    public ResponseEntity<List<BoardColumnDto>> getProjectColumns(@PathVariable UUID projectId) {
        List<BoardColumn> columns = boardService.getProjectColumns(projectId);
        return ResponseEntity.ok(columns.stream()
                .map(boardMapper::toDto)
                .toList());
    }

    @PostMapping("/projects/{projectId}/columns")
    @Operation(summary = "Create new column")
    public ResponseEntity<BoardColumnDto> createColumn(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateColumnRequest request) {
        BoardColumn column = boardService.createColumn(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(boardMapper.toDto(column));
    }

    @PutMapping("/columns/{columnId}")
    @Operation(summary = "Update column")
    public ResponseEntity<BoardColumnDto> updateColumn(
            @PathVariable UUID columnId,
            @Valid @RequestBody UpdateColumnRequest request) {
        BoardColumn column = boardService.updateColumn(columnId, request);
        return ResponseEntity.ok(boardMapper.toDto(column));
    }

    @DeleteMapping("/columns/{columnId}")
    @Operation(summary = "Delete column")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteColumn(@PathVariable UUID columnId) {
        boardService.deleteColumn(columnId);
    }

    @PutMapping("/columns/{columnId}/move")
    @Operation(summary = "Move column to new position")
    public ResponseEntity<Void> moveColumn(
            @PathVariable UUID columnId,
            @RequestBody MoveRequest request) {
        boardService.moveColumn(columnId, request.getPosition());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/columns/{columnId}/cards")
    @Operation(summary = "Get all cards in a column")
    public ResponseEntity<List<CardDto>> getColumnCards(@PathVariable UUID columnId) {
        List<Card> cards = boardService.getColumnCards(columnId);
        return ResponseEntity.ok(cards.stream()
                .map(cardMapper::toDto)
                .toList());
    }

    @PostMapping("/columns/{columnId}/cards")
    @Operation(summary = "Create new card")
    public ResponseEntity<CardDto> createCard(
            @PathVariable UUID columnId,
            @Valid @RequestBody CreateCardRequest request) {
        Card card = boardService.createCard(columnId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cardMapper.toDto(card));
    }

    @GetMapping("/cards/{cardId}")
    @Operation(summary = "Get card details")
    public ResponseEntity<CardDetailDto> getCard(@PathVariable UUID cardId) {
        Card card = boardService.getCard(cardId);
        return ResponseEntity.ok(cardMapper.toDetailDto(card));
    }

    @PutMapping("/cards/{cardId}")
    @Operation(summary = "Update card")
    public ResponseEntity<CardDto> updateCard(
            @PathVariable UUID cardId,
            @Valid @RequestBody UpdateCardRequest request) {
        Card card = boardService.updateCard(cardId, request);
        return ResponseEntity.ok(cardMapper.toDto(card));
    }

    @DeleteMapping("/cards/{cardId}")
    @Operation(summary = "Delete card")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable UUID cardId) {
        boardService.deleteCard(cardId);
    }

    @PutMapping("/cards/{cardId}/move")
    @Operation(summary = "Move card to another column")
    public ResponseEntity<CardDto> moveCard(
            @PathVariable UUID cardId,
            @Valid @RequestBody MoveCardRequest request) {
        Card card = boardService.moveCard(cardId, request.getColumnId(), request.getPosition());
        return ResponseEntity.ok(cardMapper.toDto(card));
    }

    @PutMapping("/cards/{cardId}/assign")
    @Operation(summary = "Assign card to user")
    public ResponseEntity<CardDto> assignCard(
            @PathVariable UUID cardId,
            @RequestBody AssignCardRequest request) {
        Card card = boardService.assignCard(cardId, request.getUserId());
        return ResponseEntity.ok(cardMapper.toDto(card));
    }
}