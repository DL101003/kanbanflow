package com.project.kanbanflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.kanbanflow.entity.enums.ProjectRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ProjectMemberId.class)
public class ProjectMember {

    @Id
    @Column(name = "project_id")
    private UUID projectId;

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    @JsonIgnore
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private ProjectRole role = ProjectRole.VIEWER;

    @Column(name = "joined_at")
    @Builder.Default
    private Instant joinedAt = Instant.now();
}