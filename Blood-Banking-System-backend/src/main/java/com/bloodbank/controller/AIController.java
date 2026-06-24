package com.bloodbank.controller;

import com.bloodbank.dto.AIChatRequest;
import com.bloodbank.dto.AIChatResponse;
import com.bloodbank.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(@RequestBody AIChatRequest chatRequest) {
        String prompt = chatRequest.getPrompt();
        String answer = aiService.generateAssistantAnswer(prompt);
        return ResponseEntity.ok(new AIChatResponse(answer));
    }
}
