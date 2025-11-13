package com.project.kanbanflow.mapper;

import com.project.kanbanflow.dtos.BoardColumnDto;
import com.project.kanbanflow.entity.BoardColumn;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BoardMapper {
    @Mapping(target = "cardCount", expression = "java(column.getCards().size())")
    BoardColumnDto toDto(BoardColumn column);
}