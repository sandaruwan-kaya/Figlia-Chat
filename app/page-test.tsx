"use client";

import ChatThread from "./chat/components/ChatThread";

export default function Page() {
  return (
    <div className="h-screen w-full flex bg-background">
      <ChatThread />
    </div>
  );
}
