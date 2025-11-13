package com.project.kanbanflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.kanbanflow.entity.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE comments SET is_deleted = true WHERE id = ?")
@SQLRestriction(value = "is_deleted = false")
public class Comment extends BaseEntity {

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Builder.Default
    @Column(name = "is_edited")
    private boolean edited = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    @JsonIgnore
    private Card card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @PreUpdate
    private void setEditedFlag() {
        this.edited = true;
    }
}