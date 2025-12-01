package com.project.kanbanflow.repository;

import com.project.kanbanflow.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {

    List<BoardColumn> findByProjectIdOrderByPositionAsc(UUID projectId);

    @Query("SELECT COALESCE(MAX(bc.position), -1) FROM BoardColumn bc " +
            "WHERE bc.project.id = :projectId")
    Integer findMaxPositionByProjectId(@Param("projectId") UUID projectId);

    @Modifying
    @Query("UPDATE BoardColumn bc SET bc.position = bc.position + 1 " +
            "WHERE bc.project.id = :projectId AND bc.position >= :position")
    void incrementPositionsFrom(@Param("projectId") UUID projectId,
                                @Param("position") Integer position);

    @Modifying
    @Query("UPDATE BoardColumn bc SET bc.position = bc.position - 1 " +
            "WHERE bc.project.id = :projectId AND bc.position > :position")
    void decrementPositionsAfter(@Param("projectId") UUID projectId,
                                 @Param("position") Integer position);

    @Modifying
    @Query("UPDATE BoardColumn bc SET bc.position = :newPosition " +
            "WHERE bc.id = :columnId")
    void updatePosition(@Param("columnId") UUID columnId,
                        @Param("newPosition") Integer newPosition);
}