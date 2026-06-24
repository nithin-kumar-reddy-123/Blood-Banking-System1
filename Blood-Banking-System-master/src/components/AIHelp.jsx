import React, { useState } from "react";
import api from "../api/client";
import "./AIHelp.css";

const AIHelp = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to PulseShare AI. Ask me about donor registration, email verification, blood type matching, or how to submit and fulfill requests.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickPrompts = [
    "How do I verify my email after registration?",
    "Which blood type is the best match for an O+ request?",
    "What should I do if a donor is not responding?",
  ];

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const sendPrompt = async (text) => {
    if (!text.trim()) return;

    setError("");
    setLoading(true);
    addMessage("user", text);
    setPrompt("");

    try {
      const response = await api.post("/ai/chat", { prompt: text });
      addMessage("assistant", response.data.answer || "The AI assistant did not return a response.");
    } catch (err) {
      console.error(err);
      addMessage(
        "assistant",
        "I couldn't reach the AI service right now. Please try again later."
      );
      setError("Unable to connect to the AI backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendPrompt(prompt);
  };

  return (
    <div className="ai-help-page">
      <div className="ai-help-panel glass-panel">
        <div className="ai-help-header">
          <div>
            <h2>PulseShare AI Assistant</h2>
            <p>Ask anything about the blood donation process, donor matching, or account verification.</p>
          </div>
        </div>

        <div className="ai-quick-prompts">
          {quickPrompts.map((item) => (
            <button key={item} type="button" className="ai-prompt-chip" onClick={() => sendPrompt(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="ai-chat-window">
          {messages.map((message, index) => (
            <div key={index} className={`ai-chat-bubble ${message.role}`}>
              <div className="ai-chat-role">{message.role === "assistant" ? "AI" : "You"}</div>
              <div className="ai-chat-text">{message.text}</div>
            </div>
          ))}
        </div>

        <form className="ai-chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your question here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !prompt.trim()}>
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </form>

        {error && <p className="ai-error">{error}</p>}
      </div>
    </div>
  );
};

export default AIHelp;
