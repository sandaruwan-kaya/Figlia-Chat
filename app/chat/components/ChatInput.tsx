"use client";

import { useState } from "react";
import useChatStream from "../hooks/useChatStream";
import { Send, Square } from "lucide-react";

export default function ChatInput() {
  const [input, setInput] = useState("");

  const { sendMessage, stop, isLoading } = useChatStream();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input;
    setInput("");

    await sendMessage(text);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-4 border-t bg-background flex items-center gap-2"
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something..."
        className="flex-1 p-3 rounded-lg border resize-none bg-muted focus:ring-2 focus:ring-primary"
        rows={1}
      />

      {isLoading ? (
        <button
          type="button"
          onClick={stop}
          className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          <Square size={20} />
        </button>
      ) : (
        <button
          type="submit"
          className="p-3 rounded-lg bg-primary text-white hover:bg-primary/90"
        >
          <Send size={20} />
        </button>
      )}
    </form>
  );
}
