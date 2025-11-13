package com.project.kanbanflow.mapper;

import com.project.kanbanflow.dtos.CardDetailDto;
import com.project.kanbanflow.dtos.CardDto;
import com.project.kanbanflow.entity.Card;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CardMapper {
    @Mapping(target = "overdue", expression = "java(card.isOverdue())")
    @Mapping(target = "commentCount", expression = "java(card.getComments().size())")
    CardDto toDto(Card card);

    CardDetailDto toDetailDto(Card card);
}