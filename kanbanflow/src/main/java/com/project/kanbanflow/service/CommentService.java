package com.project.kanbanflow.service;

import com.project.kanbanflow.dtos.CreateCommentRequest;
import com.project.kanbanflow.dtos.UpdateCommentRequest;
import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.entity.Comment;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.exception.ForbiddenException;
import com.project.kanbanflow.exception.NotFoundException;
import com.project.kanbanflow.repository.CardRepository;
import com.project.kanbanflow.repository.CommentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final CardRepository cardRepository;
    private final UserService userService;

    public Page<Comment> getCardComments(UUID cardId, Pageable pageable) {
        // Check card exists
        if (!cardRepository.existsById(cardId)) {
            throw new NotFoundException("Card not found");
        }
        return commentRepository.findByCardIdOrderByCreatedAtDesc(cardId, pageable);
    }

    public Comment addComment(UUID cardId, CreateCommentRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        User currentUser = userService.getCurrentUser();

        Comment comment = Comment.builder()
                .content(request.getContent())
                .card(card)
                .author(currentUser)
                .build();

        return commentRepository.save(comment);
    }

    public Comment updateComment(UUID commentId, UpdateCommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));

        User currentUser = userService.getCurrentUser();
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setEdited(true);

        return commentRepository.save(comment);
    }

    public void deleteComment(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));

        User currentUser = userService.getCurrentUser();
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Can only delete your own comments");
        }

        commentRepository.deleteById(commentId);
    }
}