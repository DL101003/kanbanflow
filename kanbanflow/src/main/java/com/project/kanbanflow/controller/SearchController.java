package com.project.kanbanflow.controller;

import com.project.kanbanflow.dtos.CardDto;
import com.project.kanbanflow.dtos.SearchCriteria;
import com.project.kanbanflow.dtos.SearchResultDto;
import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.entity.enums.Priority;
import com.project.kanbanflow.mapper.CardMapper;
import com.project.kanbanflow.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Search APIs")
public class SearchController {

    private final SearchService searchService;
    private final CardMapper cardMapper;

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Search cards in project")
    public ResponseEntity<SearchResultDto> searchInProject(
            @PathVariable UUID projectId,
            @RequestParam String q,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) Boolean completed) {

        SearchCriteria criteria = SearchCriteria.builder()
                .query(q)
                .priority(priority)
                .assigneeId(assigneeId)
                .completed(completed)
                .build();

        return ResponseEntity.ok(searchService.searchCards(projectId, criteria));
    }

    @GetMapping("/my-tasks")
    @Operation(summary = "Search my assigned tasks")
    public ResponseEntity<Page<CardDto>> searchMyTasks(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Card> cards = searchService.searchMyTasks(q, pageable);
        return ResponseEntity.ok(cards.map(cardMapper::toDto));
    }
}