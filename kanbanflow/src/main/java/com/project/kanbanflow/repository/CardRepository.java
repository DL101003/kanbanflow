package com.project.kanbanflow.repository;

import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.entity.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface CardRepository extends JpaRepository<Card, UUID> {

    List<Card> findByBoardColumnIdOrderByPositionAsc(UUID columnId);

    Page<Card> findByAssigneeId(UUID userId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Card c WHERE c.boardColumn.id = :columnId")
    int countCardsByColumnId(@Param("columnId") UUID columnId);

    @Query("SELECT c FROM Card c WHERE c.boardColumn.project.id = :projectId " +
            "AND (:query IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:priority IS NULL OR c.priority = :priority) " +
            "AND (:assigneeId IS NULL OR c.assignee.id = :assigneeId) " +
            "AND (:completed IS NULL OR c.completed = :completed) " +
            "AND (:dueDateFrom IS NULL OR c.dueDate >= :dueDateFrom) " +
            "AND (:dueDateTo IS NULL OR c.dueDate <= :dueDateTo) ")
    List<Card> searchCards(@Param("projectId") UUID projectId,
                           @Param("query") String query,
                           @Param("priority") Priority priority,
                           @Param("assigneeId") UUID assigneeId,
                           @Param("completed") Boolean completed,
                           @Param("dueDateFrom") LocalDate dueDateFrom,
                           @Param("dueDateTo") LocalDate dueDateTo);

    @Modifying
    @Query("UPDATE Card c SET c.position = c.position + 1 " +
            "WHERE c.boardColumn.id = :columnId " +
            "AND c.position >= :position")
    void incrementPositionsFrom(@Param("columnId") UUID columnId,
                                @Param("position") Integer position);

    @Query("SELECT COALESCE(MAX(c.position), -1) FROM Card c " +
            "WHERE c.boardColumn.id = :columnId")
    Integer findMaxPositionByColumnId(@Param("columnId") UUID columnId);

    @Query("SELECT c FROM Card c WHERE c.boardColumn.id = :columnId")
    long countByBoardColumnId(@Param("columnId") UUID columnId);

    @Modifying
    @Query("UPDATE Card c SET c.position = c.position - 1 " +
            "WHERE c.boardColumn.id = :columnId " +
            "AND c.position BETWEEN :start AND :end")
    void decrementPositionsBetween(@Param("columnId") UUID columnId,
                                   @Param("start") Integer start,
                                   @Param("end") Integer end);

    @Modifying
    @Query("UPDATE Card c SET c.position = c.position + 1 " +
            "WHERE c.boardColumn.id = :columnId " +
            "AND c.position BETWEEN :start AND :end")
    void incrementPositionsBetween(@Param("columnId") UUID columnId,
                                   @Param("start") Integer start,
                                   @Param("end") Integer end);

    @Modifying
    @Query("UPDATE Card c SET c.position = c.position - 1 " +
            "WHERE c.boardColumn.id = :columnId " +
            "AND c.position > :position")
    void decrementPositionsAfter(@Param("columnId") UUID columnId,
                                 @Param("position") Integer position);

    @Query("SELECT c FROM Card c WHERE c.assignee.id = :userId " +
            "AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))) " )
    Page<Card> searchUserCards(@Param("userId") UUID userId,
                               @Param("query") String query,
                               Pageable pageable);
}