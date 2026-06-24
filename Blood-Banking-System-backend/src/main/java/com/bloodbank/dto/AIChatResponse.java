package com.bloodbank.dto;

public class AIChatResponse {
    private String answer;

    public AIChatResponse() {
    }

    public AIChatResponse(String answer) {
        this.answer = answer;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
