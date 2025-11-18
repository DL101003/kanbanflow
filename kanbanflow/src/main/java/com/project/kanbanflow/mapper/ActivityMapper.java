package com.project.kanbanflow.mapper;

import com.project.kanbanflow.dtos.ActivityDto;
import com.project.kanbanflow.dtos.UserSummaryDto;
import com.project.kanbanflow.entity.Activity;
import com.project.kanbanflow.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.util.List;

@Mapper(componentModel = "spring")
@Component
public interface ActivityMapper {

    @Mapping(target = "user", source = "user", qualifiedByName = "toUserSummary")
    ActivityDto toDto(Activity activity);

    List<ActivityDto> toDtoList(List<Activity> activities);

    @Named("toUserSummary")
    default UserSummaryDto toUserSummary(User user) {
        if (user == null) return null;
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}