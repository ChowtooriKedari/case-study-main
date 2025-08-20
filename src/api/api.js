const API_BASE = "http://localhost:8787";


export async function getAIMessage(userText, mode) {
  // Abort if backend stalls
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25_000); // 25s

  let res;
  try {
    res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        message: String(userText ?? ""),
        mode: mode ?? null,
      }),
    });
  } finally {
    clearTimeout(t);
  }

  // Throw nice errors
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Backend error (${res.status})`);
  }

  // Normalize so the UI can rely on these keys
  const data = await res.json();
  return {
    answer: data?.answer ?? "",
    products: Array.isArray(data?.products) ? data.products : [],
    orders: Array.isArray(data?.orders) ? data.orders : [],
    follow_up: Array.isArray(data?.follow_up) ? data.follow_up : [],
    references: Array.isArray(data?.references) ? data.references : [],
  };
}