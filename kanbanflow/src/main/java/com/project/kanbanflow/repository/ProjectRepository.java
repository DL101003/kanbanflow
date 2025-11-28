package com.project.kanbanflow.repository;

import com.project.kanbanflow.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN ProjectMember pm ON p.id = pm.projectId " +
            "WHERE (p.owner.id = :userId OR pm.userId = :userId) " +
            "ORDER BY p.createdAt DESC")
    Page<Project> findAllAccessibleProjects(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.id = :projectId AND " +
            "(p.owner.id = :userId OR EXISTS (SELECT 1 FROM ProjectMember pm " +
            "WHERE pm.projectId = :projectId AND pm.userId = :userId))")
    Optional<Project> findByIdAndUserHasAccess(@Param("projectId") UUID projectId,
                                               @Param("userId") UUID userId);

    @Query("SELECT CASE WHEN COUNT(pm) > 0 THEN true ELSE false END " +
            "FROM ProjectMember pm WHERE pm.projectId = :projectId " +
            "AND pm.userId = :userId AND pm.role = :role")
    boolean hasUserRole(@Param("projectId") UUID projectId,
                        @Param("userId") UUID userId,
                        @Param("role") String role);
}