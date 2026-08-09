"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8080";
const CATALOG_URL = process.env.NEXT_PUBLIC_CATALOG_URL ?? "http://localhost:8081";

const FALLBACK_QUERIES = [
  "Cozy gifts under $100",
  "Best gifts for her",
  "Show me shoes",
  "Luxury beauty gifts",
];

type Role = "user" | "assistant";

interface Recommendation {
  style_id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  reason: string;
  score: number;
}

interface ChatMessage {
  role: Role;
  content: string;
  recommendations?: Recommendation[];
  loading?: boolean;
}

function sessionId() {
  if (typeof window === "undefined") return "sess_ssr";
  let id = sessionStorage.getItem("ai_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("ai_session_id", id);
  }
  return id;
}

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>(FALLBACK_QUERIES);

  useEffect(() => {
    fetch(`${CATALOG_URL}/api/v1/products?page_size=100`)
      .then((r) => r.json())
      .then((d) => {
        const cats = [...new Set<string>((d.products ?? []).map((p: { category: string }) => p.category))].slice(0, 4);
        if (cats.length > 0) setSuggestedQueries(cats.map((c) => `Show me ${c} gifts`));
      })
      .catch(() => {}); // keep fallback
  }, []);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;

    const userMsg: ChatMessage = { role: "user", content: msg };
    const placeholder: ChatMessage = { role: "assistant", content: "", loading: true };
    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setSending(true);

    const history = messages
      .filter((m) => !m.loading && m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${GATEWAY_URL}/ai/api/v1/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId(), message: msg, history }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: data.message, recommendations: data.recommendations ?? [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Ask our AI Shopping Assistant"}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white pl-4 pr-5 h-12 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        <span className="text-sm font-medium tracking-wide">
          {open ? "Close" : "Shopping Assistant"}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-900 text-white rounded-t-2xl">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium tracking-wide">Shopping Assistant</p>
              <p className="text-xs text-white/50">Powered by AI · searches our full catalog</p>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            {/* Empty state */}
            {isEmpty && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">Hi! How can I help you today?</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ask me anything — I'll search our catalog and find products that match.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Try asking</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedQueries.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-left text-xs px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 transition-colors leading-snug"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] space-y-3">
                  {/* Bubble */}
                  <div className={`text-sm rounded-2xl px-4 py-2.5 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gray-900 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    {msg.loading ? (
                      <span className="flex gap-1 items-center py-0.5">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </span>
                    ) : msg.content}
                  </div>

                  {/* Product cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest ml-1">
                        {msg.recommendations.length} product{msg.recommendations.length > 1 ? "s" : ""} found
                      </p>
                      {msg.recommendations.map((rec) => (
                        <Link
                          key={rec.style_id}
                          href={`/product?style_id=${rec.style_id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-900 hover:shadow-sm transition-all group"
                        >
                          {rec.image_url && (
                            <img
                              src={rec.image_url}
                              alt={rec.name}
                              className="w-14 h-14 object-cover rounded-lg shrink-0 bg-gray-100"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide truncate">{rec.brand}</p>
                            <p className="text-xs font-medium text-gray-900 leading-snug line-clamp-2 group-hover:underline">{rec.name}</p>
                            <p className="text-xs font-semibold text-gray-900 mt-0.5">${rec.price.toFixed(2)}</p>
                            {rec.reason && (
                              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 italic leading-snug">{rec.reason}</p>
                            )}
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="shrink-0 group-hover:stroke-gray-900 transition-colors">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Search for products, ask for advice…"
              disabled={sending}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-gray-700 disabled:opacity-40 transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
