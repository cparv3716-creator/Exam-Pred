"use client";

import {
  Bot,
  LoaderCircle,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  content: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

const CHAT_QUIET_ROUTES = [
  "/auth",
  "/login",
  "/signup",
  "/logout",
  "/payment",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function shouldHideChat(pathname: string) {
  return CHAT_QUIET_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi, I am Statstrive AI. Ask me about exam prep, a difficult concept, practice strategy, the dashboard, or your subscription.",
  },
];

export function FloatingChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messageId = useRef(INITIAL_MESSAGES.length);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading, messages]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();

    const message = input.trim();
    if (!message || isLoading) {
      return;
    }

    messageId.current += 1;
    setMessages((current) => [
      ...current,
      { id: messageId.current, role: "user", content: message },
    ]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json().catch(() => ({}))) as ChatResponse;

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Could not get a response.");
      }

      messageId.current += 1;
      setMessages((current) => [
        ...current,
        { id: messageId.current, role: "assistant", content: data.reply! },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  if (shouldHideChat(pathname)) {
    return null;
  }

  return (
    <div className="fixed right-4 z-50 flex flex-col items-end sm:right-6" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
      {isOpen && (
        <section
          aria-label="Statstrive AI chat"
          className="mb-3 flex h-[min(70vh,600px)] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl sm:mb-4 sm:h-[600px]"
        >
          <header className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan">
                <Bot size={21} aria-hidden />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white">Statstrive AI</h2>
                  <Sparkles size={13} className="text-cyan-300" aria-hidden />
                </div>
                <p className="text-xs text-slate-400">Your exam preparation assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Close chat"
            >
              <X size={19} aria-hidden />
            </button>
          </header>

          <div
            className="flex-1 space-y-4 overflow-y-auto px-4 py-5"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-md bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                      : "rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-3.5 py-3 text-sm text-slate-400">
                  <LoaderCircle size={16} className="animate-spin text-cyan-300" aria-hidden />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 bg-slate-950/80 p-3">
            {error && (
              <p role="alert" className="mb-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            )}
            <form onSubmit={sendMessage} className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={2_000}
                rows={1}
                placeholder="Ask Statstrive AI..."
                aria-label="Chat message"
                disabled={isLoading}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={18} aria-hidden />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-600">
              AI responses can be inaccurate. Verify important exam and payment details.
            </p>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 transition hover:scale-105 hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-95 sm:h-16 sm:w-16"
        aria-label={isOpen ? "Close Statstrive AI chat" : "Open Statstrive AI chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} aria-hidden /> : <MessageCircle size={27} aria-hidden />}
      </button>
    </div>
  );
}
