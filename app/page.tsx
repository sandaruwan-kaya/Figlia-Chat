"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Plus, Trash2, Edit2 } from "lucide-react";
import { useChat, type Message } from "./context/chat-context";

import MessageBubble from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";

export default function ChatBot() {
  const {
    chats,
    currentChat,
    currentChatId,
    createNewChat,
    selectChat,
    deleteChat,
    clearAllChats,
    renameChat,
    addMessage,
    updateLastBotMessage,
  } = useChat();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const abortController = useRef<AbortController | null>(null);

  // Auto-scroll on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent | KeyboardEvent) => {
    if ("preventDefault" in e) e.preventDefault();
    if (!input.trim()) return;

    let activeChatId = currentChatId;

    // 1️⃣ Create chat automatically if none selected
    if (!activeChatId) {
      createNewChat();
      await new Promise((resolve) => setTimeout(resolve, 30));
      activeChatId = chats[chats.length - 1]?.id;
    }
    if (!activeChatId) return;

    const activeChat = chats.find((c) => c.id === activeChatId);
    const previousMessages = activeChat?.messages || [];

    // 2️⃣ User message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    // 3️⃣ Bot placeholder (for streaming)
    const botMessage: Message = {
      id: crypto.randomUUID(),
      text: "",
      sender: "bot",
      timestamp: new Date(),
    };
    addMessage(botMessage);

    abortController.current = new AbortController();
    setIsLoading(true);

    // 4️⃣ API request
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
      signal: abortController.current.signal,
    });

    // 5️⃣ Streaming back
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let botText = "";

    if (!reader) return;

    while (true) {
      try {
        const { done, value } = await reader.read();
        if (done) break;

        botText += decoder.decode(value);
        updateLastBotMessage(botText);

      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("🛑 STOP: stream aborted cleanly");
          break;
        }
        throw err;
      }
    }


    setIsLoading(false);
  };

  const handleStop = () => {
  if (abortController.current) {
    abortController.current.abort();
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
          className="w-full justify-start mb-3 gap-2"
        >
          <Plus className="w-4 h-4" /> New Chat
        </Button>

        {/* <Button
          variant="destructive"
          className="w-full mb-3"
          onClick={() => {
            if (confirm("Delete all chats?")) clearAllChats();
          }}
        >
          Delete All Chats
        </Button> */}

        {/* Chat history list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 mb-4">
          {chats.map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const preview =
              lastMsg?.text.length > 40
                ? lastMsg.text.slice(0, 40) + "..."
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

                  {/* Rename */}
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTitle = prompt("Rename chat:");
                      if (newTitle) renameChat(chat.id, newTitle);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button> */}

                  {/* Delete */}
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
        {/* Header */}
        <div className="border-b border-border bg-card p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {currentChat?.title || "Chat Assistant"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Always here to help
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Welcome screen */}
          {!currentChat && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="mb-4 text-4xl">🤖</div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to ChatBot</h2>
              <p className="text-sm">Start a conversation by typing below.</p>
            </div>
          )}

          {/* Messages */}
          {currentChat?.messages?.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 items-end"
          >
            {/* Multi-line input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={1}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 resize-none p-2 rounded-md border border-input focus:outline-none"
            />

            {isLoading ? (
              <Button
                onClick={handleStop}
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim()}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
