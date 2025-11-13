"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";                // ← IMPORTANT!
import rehypeRaw from "rehype-raw";
// @ts-ignore
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Message } from "@/app/context/chat-context";
import { Bot, User } from "lucide-react";

export default function MessageBubble({ message }: { message: Message }) {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex w-full ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-sm border ${
          isBot ? "bg-[#eef3f7] border-gray-300" : "bg-primary text-primary-foreground border-primary"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {isBot ? (
            <Bot className="w-5 h-5 text-gray-700" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
          <span className="font-semibold text-sm">
            {isBot ? "Assistant" : "You"}
          </span>
        </div>

        {/* Markdown Body */}
        <div
          className={`prose prose-sm max-w-none break-words ${
            isBot ? "text-gray-800" : "text-white"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}     // ← fixes lists, tables, spacing
            rehypePlugins={[rehypeRaw]}
            components={{
              p({ children }) {
                return <p className="mb-3 leading-relaxed">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-6 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-6 space-y-1">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-relaxed">{children}</li>;
              },
              code({ inline, className, children }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomOneLight}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="px-1 py-0.5 rounded bg-black/10 text-[0.85em]">
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
