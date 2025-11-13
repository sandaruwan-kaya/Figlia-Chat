"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Trash2, Plus } from "lucide-react";
import { useChat, type Message } from "./context/chat-context";

export default function ChatBot() {
  const {
    chats,
    currentChat,
    currentChatId,
    createNewChat,
    selectChat,
    deleteChat,
    addMessage,
    updateLastBotMessage,
  } = useChat();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // 1️⃣ Determine or create chat BEFORE sending message
    let chatId = currentChatId;

    if (!chatId) {
      createNewChat();

      // Wait for React to update the new chat
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Get the newly created chat
      const latestChat = chats[chats.length - 1];
      chatId = latestChat?.id;
    }

    if (!chatId) return; // fail-safe

    // Identify current chat safely
    const activeChat = chats.find((c) => c.id === chatId);
    const previousMessages = activeChat?.messages || [];

    // 2️⃣ Add USER message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    // 3️⃣ Add placeholder BOT message for streaming updates
    const botMessage: Message = {
      id: crypto.randomUUID(),
      text: "",
      sender: "bot",
      timestamp: new Date(),
    };
    addMessage(botMessage);

    // 4️⃣ Call the OpenAI API with fully correct message history
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          ...previousMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
          { role: "user", content: userMessage.text },
        ],
      }),
    });

    // 5️⃣ Streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let botText = "";

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      botText += decoder.decode(value);
      updateLastBotMessage(botText);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-card border-r border-border flex-col p-4">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold">ChatBot</h1>
        </div>

        <Button
          onClick={createNewChat}
          variant="outline"
          className="w-full justify-start mb-4 bg-transparent hover:bg-muted gap-2"
        >
          <Plus className="w-4 h-4" /> New Chat
        </Button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 mb-4">
          {chats.map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const preview =
              lastMsg?.text.length > 35
                ? lastMsg.text.slice(0, 35) + "..."
                : lastMsg?.text;

            return (
              <div
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`group p-3 rounded-lg cursor-pointer border border-transparent transition-all duration-150 ${
                  currentChatId === chat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted hover:border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{chat.title}</p>
                    {lastMsg && (
                      <p className="text-xs opacity-70 truncate mt-0.5">
                        {preview}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>

                {lastMsg && (
                  <p className="text-[10px] opacity-60 mt-1">
                    {lastMsg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>© 2025 ChatBot</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {currentChat?.title || "Chat Assistant"}
            </h2>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
          <Button
            onClick={createNewChat}
            variant="outline"
            size="icon"
            className="md:hidden bg-transparent"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex">
              <div className="bg-muted text-foreground px-4 py-2 rounded-lg flex gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
