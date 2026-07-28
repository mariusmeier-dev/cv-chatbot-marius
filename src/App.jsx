import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

const START_VORSCHLAEGE = [
  {
    label: "Fragen Sie mich zu Marius' Projekten",
    message: "Erzählen Sie mir etwas zu Marius' Projekten.",
  },
  {
    label: "Fragen Sie mich zu Marius' Arbeitsweise",
    message: "Wie arbeitet Marius? Was zeichnet seine Arbeitsweise aus?",
  },
  {
    label: "Fragen Sie mich zu Marius' Persönlichkeit",
    message: "Was für ein Mensch ist Marius? Erzählen Sie mir etwas zu seiner Persönlichkeit.",
  },
  {
    label: "Was macht Marius in der Freizeit?",
    message: "Was macht Marius in der Freizeit?",
  },
  {
    label: "Was war Marius' Anteil an den Turnaround-Projekten?",
    message: "Was war Marius' Anteil an den Turnaround-Projekten?",
  },
  {
    label: "Welche internen Weiterbildungen hat Marius gemacht?",
    message: "Welche internen Weiterbildungen hat Marius gemacht?",
  },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("API-Fehler: " + response.status);
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.answer }]);
    } catch (e) {
      setError("Es gab ein Problem beim Abrufen der Antwort. Bitte versuchen Sie es gleich nochmal.");
      setMessages(newMessages);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleSubmit(e) {
    if (e) e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold text-stone-900">Marius Meier</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Interaktiver CV-Chatbot für Recruiter
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-6 py-6">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pb-6"
          style={{ minHeight: "400px", maxHeight: "calc(100vh - 260px)" }}
        >
          {messages.length === 0 && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-stone-200 p-5 space-y-3">
                <p className="text-stone-800 leading-relaxed">
                  Hallo, ich beantworte gerne Fragen zu Marius Meier, seiner
                  Erfahrung, seiner Arbeitsweise und seinen Projekten. Fragen
                  Sie einfach frei drauf los, oder wählen Sie eine der
                  Richtungen unten als Einstieg.
                </p>
                <p className="text-stone-800 leading-relaxed">
                  Marius wird sich sicher freuen, dass Sie das Tool
                  ausprobieren. Erzählen Sie ihm davon gerne im Interview.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {START_VORSCHLAEGE.map((vorschlag) => (
                  <button
                    key={vorschlag.label}
                    onClick={() => sendMessage(vorschlag.message)}
                    className="px-4 py-2 text-sm bg-white border border-stone-300 rounded-full hover:bg-stone-100 transition-colors text-stone-700"
                  >
                    {vorschlag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-stone-900 text-white"
                    : "bg-white border border-stone-200 text-stone-800"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-500 text-sm">
                <span className="inline-block animate-pulse">Antwortet ...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 pt-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ihre Frage zu Marius ..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-lg border border-stone-300 px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent disabled:bg-stone-100 disabled:text-stone-400"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="bg-stone-900 text-white rounded-lg px-4 h-12 flex items-center justify-center hover:bg-stone-800 disabled:bg-stone-300 transition-colors"
              aria-label="Senden"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Diese App nutzt künstliche Intelligenz, die Fehler machen und
            Sachverhalte verkürzt darstellen kann. Sie arbeitet auf einer
            begrenzten Wissensbasis über Marius Meier. Bei wichtigen Fragen
            freut sich Marius über ein persönliches Gespräch.
          </p>
        </div>
      </main>
    </div>
  );
}
