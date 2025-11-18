package com.project.kanbanflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class KanbanflowApplication {

	public static void main(String[] args) {
		SpringApplication.run(KanbanflowApplication.class, args);
	}

}
