import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, LayoutDashboard, Bot } from "lucide-react";

export default function App() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(0);
  const [loading, setLoading] = useState(false);

  const [editingChatIndex, setEditingChatIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const scrollRef = useRef(null);

  const messages = chats[activeChat]?.messages || [];

  // ✅ LOAD FROM BACKEND
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/chats/")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setChats(data);
        } else {
          setChats([
            {
              id: Date.now(),
              title: "New Chat",
              messages: []
            }
          ]);
        }
      });
  }, []);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // ✅ SAVE TO BACKEND
  const saveToBackend = (chat) => {
    fetch("http://127.0.0.1:8000/api/save-chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chat),
    });
  };

  // Rename
  const saveTitle = (index) => {
    const finalTitle = editTitle.trim() || "New Chat";

    setChats(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        title: finalTitle
      };

      saveToBackend(updated[index]);

      return updated;
    });

    setEditingChatIndex(null);
    setEditTitle("");
  };

  // Delete one chat
  const deleteChat = (index) => {
    setChats(prev => {
      const updated = prev.filter((_, i) => i !== index);

      if (updated.length === 0) {
        return [
          {
            id: Date.now(),
            title: "New Chat",
            messages: []
          }
        ];
      }

      return updated;
    });

    setActiveChat(0);
  };

  // Delete all chats
  const deleteAllChats = async () => {
    await fetch("http://127.0.0.1:8000/api/delete-all/", {
      method: "DELETE",
    });

    setChats([
      {
        id: Date.now(),
        title: "New Chat",
        messages: []
      }
    ]);

    setActiveChat(0);
  };

  const askAI = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };

    let updatedChat;

    setChats(prev => {
      const updated = [...prev];
      const chat = { ...updated[activeChat] };

      chat.messages = [...chat.messages, userMessage];

      if (chat.messages.length === 1) {
        chat.title = query.slice(0, 20);
      }

      updated[activeChat] = chat;
      updatedChat = chat;

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

        saveToBackend(chat);

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

        <div className="flex w-full">

          {/* SIDEBAR */}
          <div className="w-64 bg-white/5 border-r border-white/10 p-4 flex flex-col">

            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-white/90">
              <LayoutDashboard size={18} />
              Dashboard
            </h2>

            <button
              onClick={() => {
                const newChat = {
                  id: Date.now(),
                  title: "New Chat",
                  messages: []
                };
                setChats(prev => [...prev, newChat]);
                setActiveChat(chats.length);
              }}
              className="bg-purple-500/20 hover:bg-purple-500/40 p-2 rounded-lg mb-2"
            >
              + New Chat
            </button>

            <button
              onClick={deleteAllChats}
              className="text-xs text-white/40 hover:text-red-400 mb-4 text-left"
            >
              Clear all chats
            </button>

            <div className="flex flex-col gap-2">
              {chats.map((chat, index) => (
                <div
                  key={chat.id}
                  className={`p-2 rounded text-sm ${
                    index === activeChat
                      ? "bg-purple-500/30"
                      : "hover:bg-white/10"
                  }`}
                >
                  <div className="group flex items-center justify-between gap-2">

                    {editingChatIndex === index ? (
                      <input
                        className="w-full bg-transparent outline-none text-sm"
                        value={editTitle}
                        autoFocus
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => saveTitle(index)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveTitle(index);
                        }}
                      />
                    ) : (
                      <>
                        <span
                          onClick={() => {
                            setActiveChat(index);
                            setEditingChatIndex(null);
                          }}
                          className="flex-1 truncate cursor-pointer"
                        >
                          {chat.title}
                        </span>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">

                          <button
                            onClick={() => {
                              setEditingChatIndex(index);
                              setEditTitle(chat.title);
                            }}
                            className="text-white/40 hover:text-white"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => deleteChat(index)}
                            className="text-white/40 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>

                        </div>
                      </>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col">

            <div className="p-4 border-b border-white/10 text-center flex items-center justify-center gap-2 text-white/90">
              <Bot size={18} />
              AI Code Explainer
            </div>

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