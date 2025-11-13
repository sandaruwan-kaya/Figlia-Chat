"use client";

import ChatThread from "./components/ChatThread";

export default function Page() {
  return (
    <div className="h-screen w-full flex bg-background">
      <ChatThread />
    </div>
  );
}
