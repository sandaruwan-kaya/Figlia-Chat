"use client";

import { useChat } from "../../context/chat-context";
import MessageBubble from "@/components/MessageBubble";
import { useEffect, useRef } from "react";

export default function ChatMessages() {
  const { currentChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {currentChat?.messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
