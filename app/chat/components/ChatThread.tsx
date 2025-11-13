"use client";

import ChatSidebar from "./ChatSidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChat } from "../../context/chat-context";
import EmptyState from "./EmptyState";

export default function ChatThread() {
  const { currentChat } = useChat();

  return (
    <div className="flex h-full w-full">
      <ChatSidebar />

      <div className="flex flex-col flex-1">
        {/* If no chat selected → show placeholder */}
        {!currentChat ? (
          <EmptyState />
        ) : (
          <>
            <ChatMessages />
            <ChatInput />
          </>
        )}
      </div>
    </div>
  );
}
