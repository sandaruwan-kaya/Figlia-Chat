"use client";

import { useRef, useState } from "react";
import { useChat } from "../../context/chat-context";

export default function useChatStream() {
  const {
    currentChatId,
    currentChat,
    createNewChat,
    addMessage,
    updateLastBotMessage,
  } = useChat();

  const abortController = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    // Auto-create chat if none exists
    if (!currentChatId) createNewChat();

    const userMsg = {
      id: crypto.randomUUID(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // Add empty bot message to start streaming
    const botStart = {
      id: crypto.randomUUID(),
      text: "",
      sender: "bot",
      timestamp: new Date(),
    };
    addMessage(botStart);

    setIsLoading(true);

    abortController.current = new AbortController();

    const response = await fetch(
      "https://workflow.sandbox.kayatech.ai/api/v1/workflows/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":
            "kaya_1c0ffb0cc72bb3eee3600d5fcdc396965af42c985d90f8a622cc26dd4b10ea35",
        },
        body: JSON.stringify({
          message: text,
          workflow_id: "db6aef8d-49ce-47ec-99f0-c8c9569035d3",
          session_id: crypto.randomUUID(),
          variables: {},
          is_stream: true,
          auth_type: "API_KEY",
        }),
        signal: abortController.current.signal,
      }
    );

    if (!response.body) {
      updateLastBotMessage("⚠️ No response stream.");
      setIsLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let botText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        botText += decoder.decode(value);
        updateLastBotMessage(botText);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        updateLastBotMessage(botText + "\n\n⛔ **Stopped by user**");
      }
    }

    setIsLoading(false);
  };

  const stop = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setIsLoading(false);
  };

  return { sendMessage, stop, isLoading };
}
