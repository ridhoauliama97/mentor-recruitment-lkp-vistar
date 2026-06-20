import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircleIcon, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
}

const STORAGE_KEY = "athena_chat_history";

function ChatBubble({ role, text, isError }: Message) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : isError
              ? "bg-destructive/10 text-destructive rounded-bl-sm"
              : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const retryTextRef = useRef<string>("");
  const historyRef = useRef<Message[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((m) => ({ ...m, isError: false }));
          setMessages(cleaned);
          return;
        }
      }
    } catch {}
    setMessages([{ role: "assistant", text: "Halo! Saya Athena, Asisten Supervisor Akademi. Ada yang bisa saya bantu?" }]);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    try {
      const clean = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, text: m.text }));
      historyRef.current = clean as Message[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch {}
  }, [messages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (isOpen && e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.();
      abortRef.current = null;
    }
  }, [isOpen]);

  const sendMessage = useCallback((textOverride?: string) => {
    const text = textOverride ?? input.trim();
    if (!text || streaming) return;

    abortRef.current?.();
    abortRef.current = null;

    if (!textOverride) setInput("");
    retryTextRef.current = text;

    const userMsg: Message = { role: "user", text };

    if (textOverride) {
      setMessages((prev) => {
        const next = prev.slice(0, -1);
        return [...next, { role: "assistant", text: "" }];
      });
    } else {
      setMessages((prev) => [...prev, userMsg, { role: "assistant", text: "" }]);
    }

    setStreaming(true);

    const abort = api.chatStream(
      text,
      {
        onChunk: (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant" && !last.isError) {
              next[next.length - 1] = { ...last, text: last.text + chunk };
            }
            return next;
          });
        },
        onDone: () => {
          setStreaming(false);
        },
        onError: (msg) => {
          setStreaming(false);
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", text: msg, isError: true };
            return next;
          });
        },
      },
      historyRef.current,
    );

    abortRef.current = abort;
  }, [input, streaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ position: "fixed", bottom: 16, right: 16, zIndex: 50 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mb-3 w-[360px] overflow-hidden rounded-xl border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <MessageCircleIcon size={18} />
                <span className="text-sm font-medium">Athena — Asisten Akademi</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="h-80 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} text={m.text} isError={m.isError} />
              ))}
              {streaming && <TypingIndicator />}
              {!streaming && messages.length > 0 && messages[messages.length - 1].isError && (
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(retryTextRef.current)}
                    className="text-xs"
                  >
                    Coba Lagi
                  </Button>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex items-center gap-2 border-t p-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pesan..."
                className="h-9 flex-1 rounded-md border bg-muted px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                disabled={streaming}
              />
              <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => sendMessage()} disabled={streaming || !input.trim()}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        {isOpen ? <X size={20} /> : <MessageCircleIcon size={22} />}
      </motion.button>
    </div>
  );
}
