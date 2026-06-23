"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Compass, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface ChatInterfaceProps {
  systemPrompt?: string;
  initialMessage?: string;
  onComplete?: (messages: ChatMessage[], finalContent: string) => void;
  completionMarker?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  apiEndpoint?: string;
}

export function ChatInterface({
  initialMessage,
  onComplete,
  completionMarker,
  placeholder = "Type your message...",
  className,
  disabled = false,
  apiEndpoint = "/api/ai/chat",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessage ? [{ role: "assistant", content: initialMessage }] : []
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || isCompleted) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
          };
          return updated;
        });
      }

      const finalMessages = [...newMessages, { role: "assistant" as const, content: assistantContent }];

      if (completionMarker && assistantContent.includes(completionMarker)) {
        setIsCompleted(true);
        onComplete?.(finalMessages, assistantContent);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, isCompleted, messages, apiEndpoint, completionMarker, onComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 max-w-3xl",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {msg.role === "assistant" && (
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Compass className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[75%] whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted rounded-tl-sm"
              )}
            >
              {msg.content.replace(completionMarker ?? "", "").trim()}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Compass className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isCompleted && (
        <div className="border-t border-border p-4">
          <div className="flex gap-3 items-end max-w-3xl mx-auto">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isStreaming}
              rows={1}
              className="min-h-[44px] max-h-32 resize-none"
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming || disabled}
              size="icon"
              className="shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}
