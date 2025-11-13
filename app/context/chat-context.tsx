"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatContextType {
  chats: Chat[]
  currentChatId: string | null
  currentChat: Chat | null
  createNewChat: () => void
  selectChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  addMessage: (message: Message) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const STORAGE_KEY = "chatbot_chats"

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const savedChats = localStorage.getItem(STORAGE_KEY)
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats)
        const restoredChats = parsed.map((chat: any) => ({
          ...chat,
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
        }))
        setChats(restoredChats)
        if (restoredChats.length > 0) {
          setCurrentChatId(restoredChats[0].id)
        }
      } catch (error) {
        console.error("Failed to load chats:", error)
      }
    } else {
      // Create initial chat
      const initialChat = createChat()
      setChats([initialChat])
      setCurrentChatId(initialChat.id)
    }
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    }
  }, [chats, isMounted])

  function createChat(): Chat {
    const now = new Date()
    return {
      id: Date.now().toString(),
      title: `Chat ${new Date().toLocaleDateString()}`,
      messages: [
        {
          id: "1",
          text: "Hello! How can I help you today?",
          sender: "bot",
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    }
  }

  const createNewChat = () => {
    const newChat = createChat()
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    if (currentChatId === chatId) {
      const remaining = chats.filter((chat) => chat.id !== chatId)
      setCurrentChatId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const addMessage = (message: Message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, message],
              updatedAt: new Date(),
            }
          : chat,
      ),
    )
  }

  const currentChat = chats.find((chat) => chat.id === currentChatId) || null

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        currentChat,
        createNewChat,
        selectChat,
        deleteChat,
        addMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
