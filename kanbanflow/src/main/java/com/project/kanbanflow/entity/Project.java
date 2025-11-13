package com.project.kanbanflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.kanbanflow.entity.base.BaseEntity;
import com.project.kanbanflow.entity.enums.ProjectRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE projects SET is_deleted = true WHERE id = ?")
@SQLRestriction(value = "is_deleted = false")
public class Project extends BaseEntity {

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    @Size(max = 1000)
    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 7)
    @Column(length = 7)
    @Builder.Default
    private String color = "#3B82F6";

    @Builder.Default
    @Column(name = "is_favorite")
    private boolean favorite = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    private List<BoardColumn> columns = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProjectMember> members = new ArrayList<>();

    public void addMember(User user, ProjectRole role) {
        ProjectMember member = ProjectMember.builder()
                .projectId(this.getId())
                .userId(user.getId())
                .project(this)
                .user(user)
                .role(role)
                .build();
        members.add(member);
    }

    public void removeMember(User user) {
        members.removeIf(m -> m.getUserId().equals(user.getId()));
    }

    public void addColumn(BoardColumn column) {
        columns.add(column);
        column.setProject(this);
    }

    public void removeColumn(BoardColumn column) {
        columns.remove(column);
        column.setProject(null);
    }
}