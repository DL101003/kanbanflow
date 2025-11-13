package com.project.kanbanflow.repository;

import com.project.kanbanflow.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findByCardIdOrderByCreatedAtDesc(UUID cardId, Pageable pageable);
}