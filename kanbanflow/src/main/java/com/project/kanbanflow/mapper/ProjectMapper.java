package com.project.kanbanflow.mapper;

import com.project.kanbanflow.dtos.ProjectDetailDto;
import com.project.kanbanflow.dtos.ProjectDto;
import com.project.kanbanflow.entity.Project;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
    ProjectDto toDto(Project project);
    ProjectDetailDto toDetailDto(Project project);
}