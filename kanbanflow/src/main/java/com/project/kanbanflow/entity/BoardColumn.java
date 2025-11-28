package com.project.kanbanflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.kanbanflow.entity.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "board_columns",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "position"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE board_columns SET is_deleted = true WHERE id = ?")
@SQLRestriction(value = "is_deleted = false")
public class BoardColumn extends BaseEntity {

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    @NotNull
    @Column(nullable = false)
    private int position;

    @Size(max = 7)
    @Column(length = 7)
    private String color;

    @Column(name = "card_limit")
    private int cardLimit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    @OneToMany(mappedBy = "boardColumn", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    private List<Card> cards = new ArrayList<>();
}