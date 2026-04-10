import { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Star,
  LayoutDashboard,
  Pencil
} from "lucide-react";
import Login from "./Login";

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token") ||
    !!sessionStorage.getItem("token") ||
    !!localStorage.getItem("guest")
  );

  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [search, setSearch] = useState("");

  const [editingChatId, setEditingChatId] = useState(null);

  const scrollRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  // INIT
  useEffect(() => {
    const newChat = { id: Date.now(), title: "New Chat", messages: [] };
    setChats([newChat]);
    setActiveChatId(newChat.id);
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // FILTER + SORT
  const filteredChats = chats
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  // ASK AI (STREAMING)
  const askAI = async () => {
    if (!query.trim()) return;

    setHasStartedChat(true);

    const userMessage = { role: "user", text: query };

    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              title:
                c.messages.length === 0
                  ? query.slice(0, 20)
                  : c.title,
            }
          : c
      )
    );

    setQuery("");

    const res = await fetch("http://127.0.0.1:8000/api/ask/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const reader = res.body.getReader();
    let aiText = "";

    // Add empty AI message
    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, { role: "ai", text: "" }] }
          : c
      )
    );

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      aiText += chunk;

      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId
            ? {
                ...c,
                messages: c.messages.map((m, i) =>
                  i === c.messages.length - 1
                    ? { ...m, text: aiText }
                    : m
                ),
              }
            : c
        )
      );
    }
  };

  if (!isLoggedIn) return <Login setIsLoggedIn={setIsLoggedIn} />;

  return (
    <div className="h-screen flex bg-[#020617] text-white">

      {/* SIDEBAR */}
      <div className="w-72 bg-white/5 border-r border-white/10 p-4 flex flex-col">

        <h2 className="flex gap-2 mb-4">
          <LayoutDashboard size={18} /> Dashboard
        </h2>

        <input
          placeholder="Search chats..."
          className="mb-3 p-2 rounded bg-white/5"
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => {
            const newChat = {
              id: Date.now(),
              title: "New Chat",
              messages: [],
            };
            setChats(prev => [...prev, newChat]);
            setActiveChatId(newChat.id);
            setHasStartedChat(false);
          }}
          className="bg-purple-500/20 p-2 rounded mb-3"
        >
          + New Chat
        </button>

        {/* CHAT LIST */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`group p-2 rounded ${
                chat.id === activeChatId
                  ? "bg-purple-500/30"
                  : "hover:bg-white/10"
              }`}
            >
              <div className="flex justify-between items-center">

                {editingChatId === chat.id ? (
                  <input
                    autoFocus
                    defaultValue={chat.title}
                    onBlur={(e) => {
                      setChats(prev =>
                        prev.map(c =>
                          c.id === chat.id
                            ? { ...c, title: e.target.value }
                            : c
                        )
                      );
                      setEditingChatId(null);
                    }}
                    className="bg-transparent border-b outline-none"
                  />
                ) : (
                  <span
                    onClick={() => setActiveChatId(chat.id)}
                    className="truncate cursor-pointer"
                  >
                    {chat.title}
                  </span>
                )}

                <div className="flex gap-2 opacity-0 group-hover:opacity-100">

                  <Star
                    size={14}
                    className={chat.pinned ? "text-yellow-400" : ""}
                    onClick={() =>
                      setChats(prev =>
                        prev.map(c =>
                          c.id === chat.id
                            ? { ...c, pinned: !c.pinned }
                            : c
                        )
                      )
                    }
                  />

                  <Pencil
                    size={14}
                    onClick={() => setEditingChatId(chat.id)}
                  />

                  <Trash2
                    size={14}
                    onClick={() =>
                      setChats(prev =>
                        prev.filter(c => c.id !== chat.id)
                      )
                    }
                  />

                </div>

              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            setIsLoggedIn(false);
          }}
          className="text-red-400 mt-3"
        >
          Logout
        </button>

      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {!hasStartedChat ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <h1 className="text-5xl font-bold">AI Code Explainer</h1>

            <div className="flex gap-2 w-[500px]">
              <textarea
                className="flex-1 p-4 bg-white/5 rounded-xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={askAI}
                className="bg-purple-500 px-6 rounded-xl"
              >
                Ask AI
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b">AI Code Explainer</div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] p-4 rounded-xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-500 to-blue-500"
                        : "bg-white/5 border"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 flex gap-2 border-t">
              <input
                className="flex-1 p-3 bg-white/5 rounded-xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={askAI}
                className="bg-purple-500 px-6 rounded-xl"
              >
                Send
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}