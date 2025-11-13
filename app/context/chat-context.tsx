"use client";

import React, { createContext, useContext, useState } from "react";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

type ChatContextType = {
  chats: Chat[];
  currentChat: Chat | null;
  currentChatId: string | null;

  // Actions
  createNewChat: () => void;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  clearAllChats: () => void;
  renameChat: (id: string, newTitle: string) => void;

  addMessage: (message: Message) => void;
  updateLastBotMessage: (text: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  // Create new empty Chat
  const createNewChat = () => {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: `Chat ${chats.length + 1}`,
      messages: [],
    };

    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(id);
  };

  const selectChat = (id: string) => {
    setCurrentChatId(id);
  };

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));

    // If deleting the currently open chat → pick first one or null
    if (currentChatId === id) {
      setCurrentChatId((chats.length > 1 ? chats[0].id : null));
    }
  };

  const clearAllChats = () => {
    setChats([]);
    setCurrentChatId(null);
  };

  const renameChat = (id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, title: newTitle } : chat
      )
    );
  };

  const addMessage = (message: Message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  };

  // Streaming updates to bot message
  const updateLastBotMessage = (text: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        if (chat.messages.length === 0) return chat;

        const updated = [...chat.messages];
        const lastIndex = updated.length - 1;

        // Only update if last message is from bot
        if (updated[lastIndex].sender === "bot") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            text,
          };
        }

        return { ...chat, messages: updated };
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used inside ChatProvider");
  return context;
}
