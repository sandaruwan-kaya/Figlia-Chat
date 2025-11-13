export function TypingIndicator() {
  return (
    <div className="flex gap-1 p-2">
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></span>
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></span>
    </div>
  );
}
