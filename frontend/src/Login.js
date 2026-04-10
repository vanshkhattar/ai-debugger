import { useState } from "react";

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.access) {
      if (rememberMe) {
        localStorage.setItem("token", data.access);
      } else {
        sessionStorage.setItem("token", data.access);
      }
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white">

      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl w-80 shadow-lg">

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Welcome Back
        </h2>

        {/* Username */}
        <input
          className="w-full mb-4 p-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          className="w-full mb-4 p-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Remember me */}
        <div className="flex items-center gap-2 mb-4 text-sm text-white/70">
          <input
            type="checkbox"
            className="accent-purple-500"
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl font-medium hover:opacity-90 transition"
        >
          Login
        </button>

        {/* Divider */}
        <div className="text-center text-white/40 my-4 text-sm">
          or
        </div>

        {/* Guest button */}
        <button
          onClick={() => {
            localStorage.setItem("guest", "true");
            setIsLoggedIn(true);
          }}
          className="w-full border border-white/10 p-3 rounded-xl hover:bg-white/5 transition"
        >
          Continue as Guest
        </button>

      </div>
    </div>
  );
}