"use client";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10 text-gray-600">
      <div className="text-4xl mb-4">💬</div>

      <h2 className="text-xl font-semibold mb-2">Start a new conversation</h2>

      <p className="text-sm max-w-md leading-relaxed">
        Ask anything to begin. Your chat history will appear here.
      </p>
    </div>
  );
}
