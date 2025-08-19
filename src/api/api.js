export const getAIMessage = async (userQuery) => {
  try {
    const res = await fetch("https://case-study-main.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userQuery })
    });
    if (!res.ok) throw new Error("backend error");
    const data = await res.json();
    return { role: "assistant", content: data.answer || "Sorry, I could not find that." };
  } catch (e) {
    return { role: "assistant", content: "Could not reach the backend." };
  }
};
