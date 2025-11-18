package com.project.kanbanflow.repository;

import com.project.kanbanflow.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    Page<Activity> findByProjectIdOrderByCreatedAtDesc(UUID projectId, Pageable pageable);

    List<Activity> findByEntityIdAndEntityTypeOrderByCreatedAtDesc(UUID entityId, String entityType);

    @Query("SELECT a FROM Activity a WHERE a.project.id = :projectId " +
            "AND a.createdAt >= :startDate ORDER BY a.createdAt DESC")
    List<Activity> findRecentActivities(@Param("projectId") UUID projectId,
                                        @Param("startDate") Instant startDate);
}