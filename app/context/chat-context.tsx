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
  createNewChat: () => void;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addMessage: (message: Message) => void;
  updateLastBotMessage: (text: string) => void; // <-- NEW
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const currentChat = chats.find((c) => c.id === currentChatId) || null;

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

    if (currentChatId === id) {
      setCurrentChatId(chats.length > 1 ? chats[0].id : null);
    }
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

  /**
   * Updates ONLY the last bot message (used for streaming)
   */
  const updateLastBotMessage = (text: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        const updatedMessages = [...chat.messages];
        const lastIndex = updatedMessages.length - 1;

        if (lastIndex < 0) return chat;
        if (updatedMessages[lastIndex].sender !== "bot") return chat;

        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          text,
        };

        return { ...chat, messages: updatedMessages };
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
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
