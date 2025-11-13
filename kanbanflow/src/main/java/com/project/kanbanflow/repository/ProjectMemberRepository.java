package com.project.kanbanflow.repository;

import com.project.kanbanflow.entity.ProjectMember;
import com.project.kanbanflow.entity.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {

    List<ProjectMember> findByProjectId(UUID projectId);

    List<ProjectMember> findByUserId(UUID userId);

    Optional<ProjectMember> findByProjectIdAndUserId(UUID projectId, UUID userId);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    @Modifying
    @Query("DELETE FROM ProjectMember pm WHERE pm.projectId = :projectId AND pm.userId = :userId")
    void deleteByProjectIdAndUserId(@Param("projectId") UUID projectId, @Param("userId") UUID userId);
}