package com.project.kanbanflow.service;

import com.project.kanbanflow.dtos.SearchCriteria;
import com.project.kanbanflow.dtos.SearchResultDto;
import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.entity.User;
import com.project.kanbanflow.mapper.CardMapper;
import com.project.kanbanflow.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final CardRepository cardRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final CardMapper cardMapper;

    public SearchResultDto searchCards(UUID projectId, SearchCriteria criteria) {
        // Verify user has access to project
        projectService.getProject(projectId);

        List<Card> cards = cardRepository.searchCards(
                projectId,
                criteria.getQuery(),
                criteria.getPriority(),
                criteria.getAssigneeId(),
                criteria.getCompleted(),
                criteria.getDueDateFrom(),
                criteria.getDueDateTo()
        );

        // Build facets
        Map<String, Integer> facets = new HashMap<>();
        facets.put("total", cards.size());
        facets.put("completed", (int) cards.stream().filter(Card::isCompleted).count());
        facets.put("overdue", (int) cards.stream().filter(Card::isOverdue).count());

        return SearchResultDto.builder()
                .cards(cards.stream().map(cardMapper::toDto).toList())
                .totalResults(cards.size())
                .facets(facets)
                .build();
    }

    public Page<Card> searchMyTasks(String query, Pageable pageable) {
        User currentUser = userService.getCurrentUser();

        if (StringUtils.hasText(query)) {
            return cardRepository.searchUserCards(currentUser.getId(), query, pageable);
        } else {
            return cardRepository.findByAssigneeId(currentUser.getId(), pageable);
        }
    }
}