package com.bloodbank.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private final String geminiApiKey;
    private final String geminiUrl;
    private final String model;
    private final RestTemplate restTemplate;

    public AIService(
            @Value("${gemini.api.key:}") String geminiApiKey,
            @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/}") String geminiUrl,
            @Value("${gemini.model:gemini-1.5-flash}") String model
    ) {
        this.geminiApiKey = geminiApiKey;
        this.geminiUrl = geminiUrl;
        this.model = model;
        this.restTemplate = new RestTemplate();
    }

    public String generateAssistantAnswer(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return "Please share a question or request so the AI assistant can help.";
        }

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return "AI assistant is not configured. Please set the GEMINI_API_KEY environment variable (or gemini.api.key in application.properties) and restart the server.";
        }

        try {
            String systemPrompt = "You are PulseShare, a friendly and trustworthy blood bank assistant. " +
                    "Help users with donor registration, email verification, blood type matching, and donation logistics in a clear, concise, and safe way.";

            String fullUrl = geminiUrl + model + ":generateContent?key=" + geminiApiKey;

            Map<String, Object> requestBody = new HashMap<>();
            
            // System Instruction
            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", Map.of("text", systemPrompt));
            requestBody.put("system_instruction", systemInstruction);

            // Contents
            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("parts", List.of(Map.of("text", prompt)));
            contentPart.put("role", "user");
            requestBody.put("contents", List.of(contentPart));

            // Generation Config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("maxOutputTokens", 500);
            requestBody.put("generationConfig", generationConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(fullUrl, HttpMethod.POST, request, Map.class);

            if (response.getBody() == null || response.getBody().get("candidates") == null) {
                return "AI service returned an unexpected response. Please try again later.";
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            if (candidates.isEmpty()) {
                return "No answer was returned by the AI service.";
            }

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            if (content == null || content.get("parts") == null) {
                return "AI did not provide an answer. Please try again.";
            }

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts.isEmpty()) {
                return "AI returned empty text.";
            }

            return String.valueOf(parts.get(0).get("text")).trim();
        } catch (Exception e) {
            return "Unable to reach the AI service right now. " +
                    "Please check the backend logs and your Gemini configuration. Error: " + e.getMessage();
        }
    }
}
