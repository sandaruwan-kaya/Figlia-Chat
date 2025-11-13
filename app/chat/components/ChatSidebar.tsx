"use client";

import { useChat } from "../../context/chat-context";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ChatSidebar() {
  const {
    chats,
    currentChatId,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    clearAllChats
  } = useChat();

  const [renameValue, setRenameValue] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);

  return (
    <div className="w-64 border-r bg-muted/50 flex flex-col">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="font-bold text-lg">Chats</h2>
        <button
          onClick={createNewChat}
          className="p-2 rounded bg-primary text-primary-foreground"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const preview =
            last?.text.length > 30
              ? last.text.slice(0, 30) + "..."
              : last?.text;

          return (
            <div
              key={c.id}
              onClick={() => selectChat(c.id)}
              className={`group p-3 rounded-lg cursor-pointer space-y-1 ${
                currentChatId === c.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex justify-between gap-2">
                <p className="font-medium truncate">{c.title}</p>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameId(c.id);
                      setRenameValue(c.title);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs opacity-70 truncate">{preview}</p>
            </div>
          );
        })}
      </div>

      {/* Clear All */}
      <div className="p-3 border-t">
        <button
          onClick={clearAllChats}
          className="w-full text-sm text-red-600 hover:opacity-80"
        >
          Clear all chats
        </button>
      </div>

      {/* Rename Modal */}
      {renameId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded p-4 w-80 space-y-3">
            <h3 className="font-semibold text-lg">Rename Chat</h3>
            <input
              className="w-full p-2 border rounded"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 rounded bg-gray-200"
                onClick={() => setRenameId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-primary text-white"
                onClick={() => {
                  renameChat(renameId, renameValue);
                  setRenameId(null);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
