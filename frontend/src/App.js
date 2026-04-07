import { motion } from "framer-motion";
import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
  if (!query) return;

  const userMessage = { role: "user", text: query };
  setMessages((prev) => [...prev, userMessage]);
  setQuery("");
  setLoading(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/api/ask/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    const aiMessage = { role: "ai", text: data.answer };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "Error connecting to backend" },
    ]);
  }

  setLoading(false);
};

  return (
  <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

    {/* Glow */}
    <div className="absolute w-[600px] h-[600px] bg-purple-600 opacity-20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
    <div className="absolute w-[500px] h-[500px] bg-blue-600 opacity-20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

    {messages.length === 0 ? (

      /* ===== LANDING ===== */
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-screen relative z-10"
      >
        <div className="w-full max-w-2xl p-6">

          <h1 className="text-5xl font-bold text-center mb-8">
            AI Code Explainer
          </h1>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">

            <textarea
              className="w-full bg-transparent border border-white/10 rounded-xl p-4"
              placeholder="Ask anything about your code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              onClick={askAI}
              className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-3"
            >
              Ask AI
            </button>

          </div>
        </div>
      </motion.div>

    ) : (

      /* ===== CHAT WITH SIDEBAR ===== */
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-screen relative z-10"
      >

        {/* SIDEBAR */}
        <div className="w-64 bg-white/5 border-r border-white/10 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">🚀 Dashboard</h2>

          <button
            onClick={() => setMessages([])}
            className="bg-purple-500/20 hover:bg-purple-500/40 p-2 rounded-lg transition mb-4"
          >
            + New Chat
          </button>

          <div className="text-sm text-white/60">
            Chat history coming soon...
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <div className="p-4 text-center border-b border-white/10">
            🤖 AI Code Explainer
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xl p-4 rounded-xl whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "ml-auto bg-gradient-to-r from-purple-500 to-blue-500"
                    : "mr-auto bg-white/5 border border-white/10"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="mr-auto flex gap-2 p-4">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></div>
              </div>
            )}

          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 flex gap-2">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3"
              placeholder="Ask more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              onClick={askAI}
              className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 rounded-xl hover:scale-105 transition"
            >
              Send
            </button>
          </div>

        </div>

      </motion.div>

    )}

  </div>
);
}