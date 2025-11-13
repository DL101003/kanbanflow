package com.project.kanbanflow.mapper;

import com.project.kanbanflow.dtos.UserDto;
import com.project.kanbanflow.dtos.UserSummaryDto;
import com.project.kanbanflow.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
    UserSummaryDto toSummaryDto(User user);
}