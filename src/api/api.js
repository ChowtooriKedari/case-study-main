const API_BASE = "https://case-study-main.onrender.com";

export async function getAIMessage(userText, mode) {
  const r = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: String(userText || ""),
      mode: mode || null,
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}
