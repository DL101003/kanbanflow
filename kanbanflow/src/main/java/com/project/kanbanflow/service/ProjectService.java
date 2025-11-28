package com.project.kanbanflow.service;

import com.project.kanbanflow.dtos.CreateProjectRequest;
import com.project.kanbanflow.dtos.ProjectMemberDto;
import com.project.kanbanflow.dtos.UpdateProjectRequest;
import com.project.kanbanflow.entity.BoardColumn;
import com.project.kanbanflow.entity.Project;
import com.project.kanbanflow.entity.ProjectMember;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.entity.enums.ProjectRole;
import com.project.kanbanflow.exception.BadRequestException;
import com.project.kanbanflow.exception.DuplicateException;
import com.project.kanbanflow.exception.ForbiddenException;
import com.project.kanbanflow.exception.NotFoundException;
import com.project.kanbanflow.mapper.UserMapper;
import com.project.kanbanflow.repository.BoardColumnRepository;
import com.project.kanbanflow.repository.ProjectMemberRepository;
import com.project.kanbanflow.repository.ProjectRepository;
import com.project.kanbanflow.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final BoardColumnRepository columnRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UserMapper userMapper;

    public Project createProject(CreateProjectRequest request) {
        User currentUser = userService.getCurrentUser();

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor())
                .owner(currentUser)
                .build();

        project = projectRepository.save(project);

        createDefaultColumns(project);

        return project;
    }

    private void createDefaultColumns(Project project) {
        String[] defaultColumns = {"To Do", "In Progress", "Review", "Done"};
        String[] colors = {"#EF4444", "#F59E0B", "#8B5CF6", "#10B981"};

        for (int i = 0; i < defaultColumns.length; i++) {
            BoardColumn column = BoardColumn.builder()
                    .name(defaultColumns[i])
                    .position(i)
                    .color(colors[i])
                    .project(project)
                    .build();
            columnRepository.save(column);
        }
    }

    public Page<Project> getUserProjects(Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        return projectRepository.findAllAccessibleProjects(currentUser.getId(), pageable);
    }

    public Project getProject(UUID projectId) {
        User currentUser = userService.getCurrentUser();
        return projectRepository.findByIdAndUserHasAccess(projectId, currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Project not found"));
    }

    public void deleteProject(UUID projectId) {
        Project project = getProject(projectId);
        User currentUser = userService.getCurrentUser();

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only owner can delete project");
        }

        projectRepository.deleteById(projectId);
    }

    public Project updateProject(UUID projectId, UpdateProjectRequest request) {
        Project project = getProject(projectId);
        User currentUser = userService.getCurrentUser();

        // Only owner or admin can update
        if (!project.getOwner().getId().equals(currentUser.getId()) &&
                !hasProjectRole(projectId, currentUser.getId(), "ADMIN")) {
            throw new ForbiddenException("No permission to update project");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColor(request.getColor());

        return projectRepository.save(project);
    }

    public void toggleFavorite(UUID projectId) {
        Project project = getProject(projectId);
        project.setFavorite(!project.isFavorite());
        projectRepository.save(project);
    }

    private boolean hasProjectRole(UUID projectId, UUID userId, String role) {
        return projectRepository.hasUserRole(projectId, userId, role);
    }

    public void addMember(UUID projectId, String email, ProjectRole role) {
        Project project = getProject(projectId);
        User currentUser = userService.getCurrentUser();

        // Check permission
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only owner can add members");
        }

        // Find user by email
        User newMember = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));

        // Check if already member
        if (memberRepository.existsByProjectIdAndUserId(projectId, newMember.getId())) {
            throw new DuplicateException("User is already a member");
        }

        ProjectMember member = ProjectMember.builder()
                .projectId(projectId)
                .userId(newMember.getId())
                .project(project)
                .user(newMember)
                .role(role)
                .build();

        memberRepository.save(member);
    }

    public void removeMember(UUID projectId, UUID userId) {
        Project project = getProject(projectId);
        User currentUser = userService.getCurrentUser();

        // Check permission
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only owner can remove members");
        }

        // Cannot remove owner
        if (project.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Cannot remove project owner");
        }

        memberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    public void updateMemberRole(UUID projectId, UUID userId, ProjectRole newRole) {
        Project project = getProject(projectId);
        User currentUser = userService.getCurrentUser();

        // Check permission
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only owner can change roles");
        }

        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found"));

        member.setRole(newRole);
        memberRepository.save(member);
    }

    public List<ProjectMemberDto> getProjectMembers(UUID projectId) {
        getProject(projectId); // Check access

        List<ProjectMember> members = memberRepository.findByProjectId(projectId);

        // Add owner to list
        Project project = projectRepository.findById(projectId).get();
        List<ProjectMemberDto> result = new ArrayList<>();

        // Owner first
        result.add(ProjectMemberDto.builder()
                .user(userMapper.toSummaryDto(project.getOwner()))
                .role("OWNER")
                .joinedAt(project.getCreatedAt())
                .build());

        // Then members
        members.forEach(member -> {
            result.add(ProjectMemberDto.builder()
                    .user(userMapper.toSummaryDto(member.getUser()))
                    .role(member.getRole().name())
                    .joinedAt(member.getJoinedAt())
                    .build());
        });

        return result;
    }

    private boolean hasProjectRole(UUID projectId, UUID userId, ProjectRole role) {
        return memberRepository.findByProjectIdAndUserId(projectId, userId)
                .map(member -> member.getRole() == role || member.getRole() == ProjectRole.ADMIN)
                .orElse(false);
    }
}