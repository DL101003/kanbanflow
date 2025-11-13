package com.project.kanbanflow.mapper;

import com.project.kanbanflow.dtos.CommentDto;
import com.project.kanbanflow.entity.Comment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    CommentDto toDto(Comment comment);
}