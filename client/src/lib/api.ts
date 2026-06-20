const BASE_URL = "/api";

function getToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${url}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Sesi berakhir, silakan login kembali");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(url: string, data: unknown) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
  chat: (message: string, history?: { role: string; text: string }[]) =>
    request<{ reply: string }>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
  chatStream: (
    message: string,
    callbacks: {
      onChunk: (text: string) => void;
      onDone: () => void;
      onError: (msg: string) => void;
    },
    history?: { role: string; text: string }[],
  ): () => void => {
    const abortController = new AbortController();
    const token = getToken();

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message, history }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          callbacks.onError(err.error || err.message || "Request failed");
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          callbacks.onError("Response body tidak tersedia");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event: ")) continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
              if (parsed.text) {
                callbacks.onChunk(parsed.text as string);
              } else if (parsed.error) {
                callbacks.onError(parsed.error as string);
                return;
              }
            } catch {
              // skip malformed JSON
            }
          }
        }

        callbacks.onDone();
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = (err as Error).message;
        if (msg.includes("NO_KEY") || msg.includes("belum dikonfigurasi")) {
          callbacks.onError("API key belum dikonfigurasi. Atur di menu Pengaturan.");
        } else {
          callbacks.onError("Gagal terhubung. Coba lagi.");
        }
      }
    })();

    return () => abortController.abort();
  },
};
