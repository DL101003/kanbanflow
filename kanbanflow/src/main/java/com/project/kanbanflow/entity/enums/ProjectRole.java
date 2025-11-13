package com.project.kanbanflow.entity.enums;

public enum ProjectRole {
    ADMIN("Admin"),
    EDITOR("Editor"),
    VIEWER("Viewer");

    private final String displayName;

    ProjectRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}