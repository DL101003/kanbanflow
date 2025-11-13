package com.project.kanbanflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.kanbanflow.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "username")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE users SET is_deleted = true WHERE id = ?")
@SQLRestriction(value = "is_deleted = false")
public class User extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(max = 255)
    @Column(name = "full_name")
    private String fullName;

    @JsonIgnore
    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Project> projects = new HashSet<>();

    @OneToMany(mappedBy = "assignee", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Card> assignedCards = new HashSet<>();
}