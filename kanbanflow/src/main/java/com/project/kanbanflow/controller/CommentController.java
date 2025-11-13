package com.project.kanbanflow.controller;

import com.project.kanbanflow.dtos.CommentDto;
import com.project.kanbanflow.dtos.CreateCommentRequest;
import com.project.kanbanflow.dtos.UpdateCommentRequest;
import com.project.kanbanflow.entity.Comment;
import com.project.kanbanflow.mapper.CommentMapper;
import com.project.kanbanflow.service.CommentService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Comment management APIs")
public class CommentController {

    private final CommentService commentService;
    private final CommentMapper commentMapper;

    @GetMapping("/cards/{cardId}/comments")
    @Operation(summary = "Get card comments")
    public ResponseEntity<Page<CommentDto>> getCardComments(
            @PathVariable UUID cardId,
            @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
        Page<Comment> comments = commentService.getCardComments(cardId, pageable);
        return ResponseEntity.ok(comments.map(commentMapper::toDto));
    }

    @PostMapping("/cards/{cardId}/comments")
    @Operation(summary = "Add comment to card")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable UUID cardId,
            @Valid @RequestBody CreateCommentRequest request) {
        Comment comment = commentService.addComment(cardId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(commentMapper.toDto(comment));
    }

    @PutMapping("/comments/{commentId}")
    @Operation(summary = "Update comment")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable UUID commentId,
            @Valid @RequestBody UpdateCommentRequest request) {
        Comment comment = commentService.updateComment(commentId, request);
        return ResponseEntity.ok(commentMapper.toDto(comment));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete comment")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable UUID commentId) {
        commentService.deleteComment(commentId);
    }
}