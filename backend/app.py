import os, json
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

DEEPSEEK_BASE = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")
PORT = int(os.getenv("PORT", "8787"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

DATA_DIR = Path(__file__).parent / "data"
PRODUCTS = json.loads((DATA_DIR / "products.json").read_text())
MODELS = json.loads((DATA_DIR / "models.json").read_text())
FAQS = json.loads((DATA_DIR / "faqs.json").read_text())

class ChatIn(BaseModel):
    message: str
    thread_id: str | None = None

def scope_check(text: str) -> bool:
    s = text.lower()
    looks_like_part = __import__("re").search(r"ps\d{6,}", s) is not None
    allow_words = [
        "refrigerator","dishwasher","fridge","gasket","rack","install",
        "part","model","compatib","order","whirlpool","ice"
    ]
    return looks_like_part or any(w in s for w in allow_words)

def find_products(query: str):
    q_terms = [t for t in query.lower().split() if t]
    def score(p):
        blob = " ".join([
            p["part_id"], p["title"], p["category"], p["brand"],
            " ".join(p.get("compatible_models", [])),
            " ".join(p.get("install_steps", []))
        ]).lower()
        return sum(t in blob for t in q_terms)
    ranked = sorted(PRODUCTS, key=score, reverse=True)
    return [p for p in ranked if score(p) > 0][:5]

def find_model(model: str):
    m = model.upper()
    for x in MODELS:
        if x["model"].upper() == m:
            return x
    return None

async def deepseek_chat(messages: list[dict], json_mode: bool = True, temperature: float = 0.2, max_tokens: int = 900):
    body = {
        "model": DEEPSEEK_MODEL,
        "messages": messages,
        "temperature": temperature
    }
    if json_mode:
        body["response_format"] = { "type": "json_object" }
    if max_tokens:
        body["max_tokens"] = max_tokens

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_KEY}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(f"{DEEPSEEK_BASE}/v1/chat/completions", headers=headers, json=body)
        r.raise_for_status()
        data = r.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return content

SYSTEM = """
You are a PartSelect chat agent.
Answer only about refrigerator and dishwasher parts, installation, model compatibility, order support, and related troubleshooting.
If the question is outside scope, refuse briefly and guide to supported topics.
Use only the provided context. If a fact is missing, ask one precise follow up.
Return a JSON object with fields answer, follow_up, products, references. No extra text.
"""

JSON_INSTRUCTIONS = """
Return only valid JSON with this shape:
{
  "answer": "string",
  "follow_up": ["string"],
  "products": [
    { "part_id": "string", "title": "string", "compatibility": "match" | "unknown" | "mismatch", "reasons": ["string"] }
  ],
  "references": ["string"]
}
"""

@app.post("/api/chat")
async def chat(body: ChatIn):
    user_text = body.message or ""
    if not scope_check(user_text):
        return {
            "answer": "I can help with refrigerator and dishwasher parts, installation, compatibility, and order support. What part number or model can I help with today",
            "follow_up": ["Check compatibility", "Show install steps", "Troubleshoot a common issue"],
            "products": [],
            "references": []
        }

    # simple entity capture
    import re
    part_id = None
    model_id = None
    m = re.search(r"(ps\d{6,})", user_text, flags=re.I)
    if m: part_id = m.group(1).upper()
    m2 = re.search(r"\b[a-z0-9]{3,}[-]?[a-z0-9]+\b", user_text, flags=re.I)
    if m2: model_id = m2.group(0).upper()

    relevant_products = find_products(user_text)

    context_lines = ["Context start"]
    for p in relevant_products:
        context_lines.append(f"product:{p['part_id']} title:{p['title']} brand:{p['brand']} category:{p['category']}")
        if p.get("compatible_models"):
            context_lines.append(f"product:{p['part_id']} compatible_models:{', '.join(p['compatible_models'])}")
        if p.get("install_steps"):
            context_lines.append(f"product:{p['part_id']} install_steps:{' | '.join(p['install_steps'])}")
    for f in FAQS:
        context_lines.append(f"faq:{f['id']} topic:{f['topic']} checks:{' | '.join(f['checks'])}")
    if model_id:
        context_lines.append(f"user_model:{model_id}")
    context_lines.append("Context end")

    messages = [
        { "role": "system", "content": SYSTEM },
        { "role": "user", "content": "\n".join(context_lines) + f"\n\nUser question:\n{user_text}\n\n{JSON_INSTRUCTIONS}" }
    ]

    content = await deepseek_chat(messages, json_mode=True, temperature=0.2, max_tokens=900)

    # try to parse JSON
    try:
        parsed = json.loads(content)
    except Exception:
        # repair once by asking the model to convert to valid JSON
        repair_messages = [
            { "role": "system", "content": "Convert the user content to valid JSON with fields answer, follow_up, products, references. Only return JSON." },
            { "role": "user", "content": content }
        ]
        fixed = await deepseek_chat(repair_messages, json_mode=True, temperature=0.0, max_tokens=900)
        try:
            parsed = json.loads(fixed)
        except Exception:
            parsed = { "answer": content, "follow_up": [], "products": [], "references": [] }

    # make sure references include sources we used
    refs = set(parsed.get("references", []))
    refs.update([f"product:{p['part_id']}" for p in relevant_products])
    if model_id:
        refs.add(f"model:{model_id}")
    parsed["references"] = sorted(refs)

    return parsed
