import { useState } from "react";
import { setTokens } from "./auth";


export default function Signup({ setIsLoggedIn }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/signup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.token) {
      setTokens(data.access, data.refresh);
      setIsLoggedIn(true);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white">

      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl w-[350px]">

        <h2 className="text-2xl mb-6 text-center">Create Account</h2>

        <input
          placeholder="Username"
          className="w-full mb-3 p-3 rounded bg-white/5 border border-white/10"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded bg-white/5 border border-white/10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signup}
          className="w-full bg-purple-500 py-3 rounded-xl"
        >
          Sign Up
        </button>

      </div>
    </div>
  );
}