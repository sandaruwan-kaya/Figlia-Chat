"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageCircle, Trash2, Plus } from "lucide-react"
import { useChat, type Message } from "./context/chat-context"

export default function ChatBot() {
  const { chats, currentChat, currentChatId, createNewChat, selectChat, deleteChat, addMessage } = useChat()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !currentChatId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    addMessage(userMessage)
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "That's a great question! I'm here to help. What else would you like to know?",
        sender: "bot",
        timestamp: new Date(),
      }
      addMessage(botMessage)
      setIsLoading(false)
    }, 800)
  }

  if (!isMounted) return null

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
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                currentChatId === chat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              onClick={() => selectChat(chat.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{chat.title}</p>
                <p className="text-xs opacity-70">
                  {chat.messages.length} message{chat.messages.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteChat(chat.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
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
            <h2 className="text-lg font-semibold">{currentChat?.title || "Chat Assistant"}</h2>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
          <Button onClick={createNewChat} variant="outline" size="icon" className="md:hidden bg-transparent">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat?.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user" ? "text-primary-foreground opacity-70" : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
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
  )
}
