import { getAccessToken, getRefreshToken, setTokens } from "./auth";

export const fetchWithAuth = async (url, options = {}) => {
  let token = getAccessToken();

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔥 If token expired → refresh
  if (res.status === 401) {
    const refresh = getRefreshToken();

    const refreshRes = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    const data = await refreshRes.json();

    if (data.access) {
      setTokens(data.access, refresh);

      // retry original request
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.access}`,
        },
      });
    } else {
      window.location.reload();
    }
  }

  return res;
};