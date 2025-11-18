package com.project.kanbanflow.service;

import com.project.kanbanflow.dtos.BoardColumnExportDto;
import com.project.kanbanflow.dtos.CardExportDto;
import com.project.kanbanflow.dtos.ProjectExportDto;
import com.project.kanbanflow.entity.BoardColumn;
import com.project.kanbanflow.entity.Card;
import com.project.kanbanflow.entity.Project;
import com.project.kanbanflow.exception.NotFoundException;
import com.project.kanbanflow.repository.BoardColumnRepository;
import com.project.kanbanflow.repository.CardRepository;
import com.project.kanbanflow.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ProjectRepository projectRepository;
    private final BoardColumnRepository columnRepository;
    private final CardRepository cardRepository;

    public byte[] exportProjectToCSV(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));

        List<BoardColumn> columns = columnRepository.findByProjectIdOrderByPositionAsc(projectId);

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Column,Card Title,Description,Priority,Status,Due Date,Assignee\n");

        for (BoardColumn column : columns) {
            List<Card> cards = cardRepository.findByBoardColumnIdOrderByPositionAsc(column.getId());
            for (Card card : cards) {
                csvBuilder.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                        column.getName(),
                        card.getTitle(),
                        card.getDescription() != null ? card.getDescription() : "",
                        card.getPriority(),
                        card.isCompleted() ? "Completed" : "In Progress",
                        card.getDueDate() != null ? card.getDueDate().toString() : "",
                        card.getAssignee() != null ? card.getAssignee().getFullName() : ""
                ));
            }
        }

        return csvBuilder.toString().getBytes(StandardCharsets.UTF_8);
    }

    public ProjectExportDto exportProjectToJSON(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));

        List<BoardColumn> columns = columnRepository.findByProjectIdOrderByPositionAsc(projectId);

        List<BoardColumnExportDto> columnDtos = columns.stream()
                .map(column -> {
                    List<Card> cards = cardRepository.findByBoardColumnIdOrderByPositionAsc(column.getId());
                    return BoardColumnExportDto.builder()
                            .name(column.getName())
                            .position(column.getPosition())
                            .cards(cards.stream().map(this::mapCardToExport).toList())
                            .build();
                })
                .toList();

        return ProjectExportDto.builder()
                .name(project.getName())
                .description(project.getDescription())
                .columns(columnDtos)
                .exportedAt(Instant.now())
                .build();
    }

    private CardExportDto mapCardToExport(Card card) {
        return CardExportDto.builder()
                .title(card.getTitle())
                .description(card.getDescription())
                .priority(card.getPriority())
                .completed(card.isCompleted())
                .dueDate(card.getDueDate())
                .assignee(card.getAssignee() != null ? card.getAssignee().getFullName() : null)
                .build();
    }
}