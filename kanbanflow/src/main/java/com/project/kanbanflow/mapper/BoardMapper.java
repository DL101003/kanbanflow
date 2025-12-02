package com.project.kanbanflow.mapper;

import com.project.kanbanflow.dtos.BoardColumnDto;
import com.project.kanbanflow.entity.BoardColumn;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CardMapper.class})
public interface BoardMapper {
    @Mapping(target = "cardCount", expression = "java(column.getCards() != null ? column.getCards().size() : 0)")
    BoardColumnDto toDto(BoardColumn column);
}