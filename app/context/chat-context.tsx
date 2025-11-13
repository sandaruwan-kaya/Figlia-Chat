"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

  // -------------------------------------
  // 🚀 Load from localStorage on first load
  // -------------------------------------
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem("chatbot-chats");
      const savedChatId = localStorage.getItem("chatbot-currentChatId");

      if (savedChats) {
        const parsedChats: Chat[] = JSON.parse(savedChats);

        // Convert timestamps back to Date objects
        parsedChats.forEach((chat) => {
          chat.messages = chat.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
        });

        setChats(parsedChats);

        if (savedChatId) {
          const exists = parsedChats.some((c) => c.id === savedChatId);
          setCurrentChatId(exists ? savedChatId : parsedChats[0]?.id || null);
        } else {
          setCurrentChatId(parsedChats[0]?.id || null);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }, []);

  // -------------------------------------
  // 💾 Save chats whenever they change
  // -------------------------------------
  useEffect(() => {
    localStorage.setItem("chatbot-chats", JSON.stringify(chats));
  }, [chats]);

  // -------------------------------------
  // 💾 Save currentChatId
  // -------------------------------------
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("chatbot-currentChatId", currentChatId);
    }
  }, [currentChatId]);

  // -------------------------------------
  // Chat Management Methods
  // -------------------------------------

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
      setCurrentChatId(null);

      setTimeout(() => {
        setCurrentChatId((prevChats) => {
          const updated = prevChats;
          return updated.length > 0 ? updated[0].id : null;
        });
      }, 20);
    }
  };

  const clearAllChats = () => {
    setChats([]);
    setCurrentChatId(null);
    localStorage.removeItem("chatbot-chats");
    localStorage.removeItem("chatbot-currentChatId");
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

  const updateLastBotMessage = (text: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== currentChatId) return chat;
        if (chat.messages.length === 0) return chat;

        const updated = [...chat.messages];
        const last = updated[updated.length - 1];

        if (last.sender === "bot") {
          updated[updated.length - 1] = { ...last, text };
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
