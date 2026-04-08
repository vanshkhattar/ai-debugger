import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([
    {
      id: Date.now(),
      messages: []
    }
  ]);

  const [activeChat, setActiveChat] = useState(0);
  const [loading, setLoading] = useState(false);

  const messages = chats[activeChat].messages;

  const scrollRef = useRef(null);

  // 🔥 ALWAYS SCROLL TO BOTTOM (REAL FIX)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const askAI = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };

    setChats(prev => {
      const updated = [...prev];
      const chat = { ...updated[activeChat] };
      chat.messages = [...chat.messages, userMessage];
      updated[activeChat] = chat;
      return updated;
    });

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

      setChats(prev => {
        const updated = [...prev];
        const chat = { ...updated[activeChat] };
        chat.messages = [...chat.messages, aiMessage];
        updated[activeChat] = chat;
        return updated;
      });

    } catch (err) {
      setChats(prev => {
        const updated = [...prev];
        const chat = { ...updated[activeChat] };
        chat.messages = [
          ...chat.messages,
          { role: "ai", text: "Error connecting to backend" }
        ];
        updated[activeChat] = chat;
        return updated;
      });
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex bg-[#020617] text-white">

      {/* ===== LANDING ===== */}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center w-full">
          <div className="w-full max-w-2xl p-6 text-center">
            <h1 className="text-5xl font-bold mb-8">
              AI Code Explainer
            </h1>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
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
        </div>
      ) : (

        /* ===== CHAT ===== */
        <div className="flex w-full">

          {/* SIDEBAR */}
          <div className="w-64 bg-white/5 border-r border-white/10 p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">🚀 Dashboard</h2>

            <button
              onClick={() => {
                const newChat = {
                  id: Date.now(),
                  messages: []
                };
                setChats(prev => [...prev, newChat]);
                setActiveChat(chats.length);
              }}
              className="bg-purple-500/20 hover:bg-purple-500/40 p-2 rounded-lg mb-4"
            >
              + New Chat
            </button>

            <div className="flex flex-col gap-2">
              {chats.map((chat, index) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(index)}
                  className={`p-2 rounded cursor-pointer text-sm ${
                    index === activeChat
                      ? "bg-purple-500/30"
                      : "hover:bg-white/10"
                  }`}
                >
                  Chat {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col">

            {/* Header */}
            <div className="p-4 border-b border-white/10 text-center">
              🤖 AI Code Explainer
            </div>

            {/* 🔥 MESSAGES (REAL FIX HERE) */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4"
            >
              {messages.map((msg, index) => (
                <div key={index} className="flex w-full">
                  <div
                    className={`max-w-[65%] p-4 rounded-xl break-words ${
                      msg.role === "user"
                        ? "ml-auto bg-gradient-to-r from-purple-500 to-blue-500"
                        : "mr-auto bg-white/5 border border-white/10"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex w-full">
                  <div className="mr-auto flex gap-2 p-4">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-white/10 flex gap-2">
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3"
                placeholder="Ask more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askAI();
                }}
              />

              <button
                onClick={askAI}
                className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 rounded-xl"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}