package com.project.kanbanflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.kanbanflow.entity.base.BaseEntity;
import com.project.kanbanflow.entity.enums.Priority;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cards",
        uniqueConstraints = @UniqueConstraint(columnNames = {"column_id", "position"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE cards SET is_deleted = true WHERE id = ?")
@SQLRestriction(value = "is_deleted = false")
public class Card extends BaseEntity {

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(nullable = false)
    private int position;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Size(max = 7)
    @Column(name = "cover_color", length = 7)
    private String coverColor;

    @Builder.Default
    @Column(name = "is_completed")
    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_column_id", nullable = false)
    @JsonIgnore
    private BoardColumn boardColumn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", updatable = false)
    private User createdBy;

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setCard(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setCard(null);
    }

    public boolean isOverdue() {
        return dueDate != null && LocalDate.now().isAfter(dueDate) && !completed;
    }
}