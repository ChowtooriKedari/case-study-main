import os, json
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
from pathlib import Path
from typing import Optional, Literal
import re

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
ORDERS = json.loads((DATA_DIR / "orders.json").read_text())
MODELS = json.loads((DATA_DIR / "models.json").read_text())
FAQS = json.loads((DATA_DIR / "faqs.json").read_text())

class ChatIn(BaseModel):
    message: str
    thread_id: Optional[str] = None
    mode: Optional[Literal["catalog","orders","issues","other"]] = None

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
You are a PartSelect chat agent for refrigerators and dishwashers only.

The UI sends a mode. Follow these rules strictly:
- mode=catalog       → You may ONLY handle product search/browse.
- mode=orders        → You may ONLY handle order history/status for a given email (or ask for email).
- mode=issues        → You may ONLY handle installation steps, compatibility checks, and troubleshooting.

If the user asks for something outside the current mode, briefly refuse and ask a question that guides them back within the mode.
"""

INTENT_JSON = """
Return ONLY valid JSON:
{
  "intent": "search_products" | "order_history" | "none",
  "query": "string | null",
  "email": "string | null",
  "reason": "short why"
}
"""

FINAL_JSON = """
Return ONLY valid JSON:
{
  "answer": "string",
  "follow_up": ["string"],
  "products": [
    { "part_id": "string", "title": "string", "brand": "string", "category": "string" }
  ],
  "orders": [
    { "order_id": "string", "created_at": "string", "status": "string",
      "items": [{ "part_id": "string", "title": "string", "qty": 0 }] }
  ],
  "references": ["string"]
}
"""

def allowed_intents_for_mode(mode: str) -> set[str]:
  if mode == "catalog": return {"search_products"}
  if mode == "orders":  return {"order_history"}
  if mode == "issues":  return {"none"}
  return {"none"}


def tool_search_products(query: str, limit: int = 10):
    if not query:
        return []
    query = query.lower()
    results = []
    for product in PRODUCTS:
        if query in product["title"].lower() or query in product.get("description", "").lower():
            results.append(product)
    return results[:limit]


def tool_order_history_by_email(email: str, limit: int = 10):
    results = [o for o in ORDERS if o["email"].lower() == email.lower()]
    return results[:limit]


def scope_check(text: str, mode: Optional[str] = None) -> bool:
    s = (text or "").lower()

    if (mode or "").lower() == "orders":
        return True

    email_like = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", s, re.I) is not None

    looks_like_part = re.search(r"ps\d{6,}", s, re.I) is not None
    allow_words = [
        "refrigerator","dishwasher","fridge","gasket","rack","install",
        "part","model","compatib","order","whirlpool","ice"
    ]
    return email_like or looks_like_part or any(w in s for w in allow_words)


def _norm_order(o: dict) -> dict:
    """Return a normalized order with consistent keys and item dicts."""
    order_id   = o.get("order_id")   or o.get("orderId")   or ""
    created_at = o.get("created_at") or o.get("orderDate") or ""
    status     = o.get("status", "")
    email      = o.get("email", "")

    items_in = o.get("items", [])
    items_out = []
    for it in items_in:
        if isinstance(it, dict):
            items_out.append({
                "partId":   it.get("partId") or it.get("part_id") or "",
                "title":    it.get("title") or it.get("name") or "",
                "quantity": it.get("quantity", 1),
                "price":    it.get("price", 0),
                "createdDate": it.get("createdDate") or it.get("created_at") or created_at,
            })
        else:
            items_out.append({
                "partId": "", "title": str(it), "quantity": 1, "price": 0,
                "createdDate": created_at,
            })

    return {
        "order_id": order_id,
        "created_at": created_at,
        "status": status,
        "email": email,
        "items": items_out,
    }


PART_RE = re.compile(r"\bps\d{6,}\b", re.I)
MODEL_RE = re.compile(r"\b[a-z0-9]{3,}[-]?[a-z0-9]+\b", re.I)

def extract_part_ids(text: str) -> list[str]:
    return list({m.group(0).upper() for m in PART_RE.finditer(text or "")})

def extract_model_ids(text: str) -> list[str]:
    return list({m.group(0).upper() for m in MODEL_RE.finditer(text or "")})

def get_product_by_part_id(pid: str) -> dict | None:
    upid = (pid or "").upper()
    for p in PRODUCTS:
        if p.get("part_id", "").upper() == upid:
            return p
    return None

def is_install_like(text: str) -> bool:
    s = (text or "").lower()
    return any(w in s for w in ["install", "installation", "replace", "how to", "fit", "step", "instructions"])

def is_compat_like(text: str) -> bool:
    s = (text or "").lower()
    return any(w in s for w in ["compat", "fit", "work with", "model", "compatible"])

def email_like(text: str) -> str | None:
    """
    Returns the first email-like substring from text if found, else None.
    """
    if not text:
        return None
    match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None

def order_id_like(text):
    # matches ORD followed by digits, e.g. ORD0009
    match = re.search(r"\bORD\d+\b", text, re.IGNORECASE)
    return match.group(0) if match else None

def get_orders_by_id(oid: str):
    """Return a list with the single normalized order for a given order id (or empty list)."""
    if not oid:
        return []
    oid_up = oid.upper()
    hits = []
    for o in ORDERS:
        oid_match = (o.get("order_id") or o.get("orderId") or "").upper()
        if oid_match == oid_up:
            hits.append(_norm_order(o))
    return hits  # 0 or 1 in your demo
def _order_total(o_norm: dict) -> float:
    total = 0.0
    for it in o_norm.get("items", []):
        try:
            qty = float(it.get("qty", 0))
            price = float(it.get("price", 0))
            total += qty * price
        except Exception:
            continue
    return round(total, 2)

@app.post("/api/chat")
async def chat(body: ChatIn):
    user_text = body.message or ""
    mode = (body.mode or "other").lower()

    if not scope_check(user_text, mode):
        return {
            "answer": "I can help with refrigerators & dishwashers. Choose: Product Catalog, Order Support, or Product Issues.",
            "follow_up": ["Search the catalog", "Check order history", "Troubleshoot an issue"],
            "products": [], "orders": [], "references": []
        }

    if mode == "orders":
        oid = order_id_like(user_text)
        em = email_like(user_text)

        # --- A) Order by ID (deterministic, no LLM) ---
        if oid:
            orders = get_orders_by_id(oid)
            if orders:
                o = orders[0]
                # build a readable summary + itemized list
                lines = [
                    f"**Order {o['order_id']}**",
                    f"Status: **{o['status']}**",
                    f"Placed: {o['created_at']}",
                ]
                if o.get("email"):
                    lines.append(f"Email: {o['email']}")
                if o.get("items"):
                    lines.append("\n**Items:**")
                    for it in o["items"]:
                        qty = it.get("qty", 1)
                        title = it.get("title", "Item")
                        pid = it.get("part_id")
                        price = it.get("price")
                        part_str = f" (Part {pid})" if pid else ""
                        price_str = f" — ${price:.2f}" if isinstance(price, (int, float)) else ""
                        lines.append(f"- {title}{part_str} ×{qty}{price_str}")
                    total = _order_total(o)
                    if total > 0:
                        lines.append(f"\n**Order total:** ${total:.2f}")

                return {
                    "answer": "\n".join(lines),
                    "follow_up": [
                        "Track this shipment",
                        "See all my orders (by email)",
                        "Help with a return"
                    ],
                    "products": [],
                    "orders": orders,   # normalized, so UI can render
                    "references": ["tool:order_by_id"]
                }
            else:
                return {
                    "answer": f"Sorry, I couldn't find any details for order **{oid}**. "
                            f"If you have the email used for the order, I can pull the full history.",
                    "follow_up": ["Look up by email", "Try another order ID"],
                    "products": [], "orders": [], "references": []
                }

        # --- B) Order history by email (your existing fast path) ---
        if em:
            hits = [o for o in ORDERS if (o.get("email","").lower() == em.lower())]
            # newest first
            hits.sort(key=lambda x: x.get("created_at") or x.get("orderDate") or "", reverse=True)
            norm = [_norm_order(o) for o in hits[:20]]

            if not norm:
                return {
                    "answer": f"I couldn’t find orders for **{em}**. If you used a different email, share that one.",
                    "follow_up": ["Try another email", "Ask about order status policies"],
                    "products": [], "orders": [], "references": []
                }

            lines = [f"Here’s your recent order history for **{em}**:"]
            for o in norm[:5]:
                lines.append(f"- **{o['order_id']}** • {o['status']} • {o['created_at']} • {len(o['items'])} item(s)")

            return {
                "answer": "\n".join(lines),
                "follow_up": ["Show details for a specific order ID", "Track a shipment"],
                "products": [],
                "orders": norm,
                "references": ["tool:order_history_by_email"]
            }

        # --- C) Neither email nor order id provided ---
        return {
            "answer": "To look up your orders, share either your **email** (used at checkout) or an **Order ID** like `ORD0009`.",
            "follow_up": ["Look up by email", "Look up by order ID"],
            "products": [], "orders": [], "references": []
        }

    part_ids = extract_part_ids(user_text)
    model_ids = extract_model_ids(user_text)
    if part_ids and mode in {"issues", "catalog"}:
        p = get_product_by_part_id(part_ids[0])
        if p:
            out_lines = [f"**{p['title']}** ({p['part_id']}) — {p.get('brand','')} {p.get('category','')}"]
            if is_install_like(user_text) and p.get("install_steps"):
                out_lines.append("**Install steps:**")
                for i, step in enumerate(p["install_steps"], 1):
                    out_lines.append(f"{i}. {step}")

            if is_compat_like(user_text) and model_ids:
                ok = [m for m in model_ids if m in (p.get("compatible_models") or [])]
                if ok:
                    out_lines.append(f"**Compatibility:** Verified with {', '.join(ok)}.")
                else:
                    out_lines.append("**Compatibility:** I don’t see that model in this part’s list. If you share the exact model tag from the door sticker, I’ll double-check.")

            if p.get("part_select_url"):
                out_lines.append(f"[View on PartSelect]({p['part_select_url']})")

            return {
                "answer": "\n\n".join(out_lines),
                "follow_up": [
                    "Check compatibility with another model",
                    "Show common symptoms for this part",
                    "Find a related part"
                ],
                "products": [{
                    "part_id": p["part_id"],
                    "title": p["title"],
                    "brand": p.get("brand",""),
                    "category": p.get("category","")
                }],
                "orders": [],
                "references": [f"product:{p['part_id']}"]
            }

  
    intent_msgs = [
        {"role": "system", "content": SYSTEM + f"\n\nCurrent mode: {mode}"},
        {"role": "user", "content": f"User: {user_text}\n\n{INTENT_JSON}"}
    ]
    raw_intent = await deepseek_chat(intent_msgs, json_mode=True, temperature=0.1, max_tokens=300)
    try:
        intent_obj = json.loads(raw_intent)
    except Exception:
        intent_obj = {"intent":"none","query":None,"email":None}

    intent = (intent_obj.get("intent") or "none").lower()
    query  = intent_obj.get("query") or None
    email  = intent_obj.get("email") or None

 
    allowed = allowed_intents_for_mode(mode)
    if intent not in allowed:
        intent = "none"
        query, email = None, None


    tool_results = {"products": [], "orders": []}
    if intent == "search_products" and mode in {"catalog", "issues"}:
        tool_results["products"] = tool_search_products(query or user_text, limit=10)
    elif intent == "order_history" and mode == "orders":
        if email:
            tool_results["orders"] = tool_order_history_by_email(email, limit=10)
   
   
    lines = [f"MODE:{mode}", "TOOL_RESULTS_START"]
    for p in tool_results["products"]:
        lines.append(f"product|{p['part_id']}|{p['title']}|{p.get('brand','')}|{p.get('category','')}")
    for o in tool_results["orders"]:
        no = _norm_order(o)
        lines.append(f"order|{no['order_id']}|{no['created_at']}|{no['status']}|{no['email']}")
        for it in no["items"]:
            lines.append(f"order_item|{no['order_id']}|{it['qty']}|{it['part_id']}|{it['title']}|{it['price']}")
    lines.append("TOOL_RESULTS_END")

    final_msgs = [
        {"role":"system","content": SYSTEM + f"\n\nCurrent mode: {mode}"},
        {"role":"user","content":
            f"User: {user_text}\n\n" + "\n".join(lines) +
            "\n\nCompose the final reply within the current mode.\n" + FINAL_JSON
        }
    ]
    raw_final = await deepseek_chat(final_msgs, json_mode=True, temperature=0.2, max_tokens=800)

    try:
        parsed = json.loads(raw_final)
    except Exception:
        repair_messages = [
            {"role":"system","content":"Convert to FINAL_JSON. Only return JSON."},
            {"role":"user","content": raw_final}
        ]
        fixed = await deepseek_chat(repair_messages, json_mode=True, temperature=0.0, max_tokens=800)
        try: parsed = json.loads(fixed)
        except Exception: parsed = {"answer": raw_final, "follow_up": [], "products": [], "orders": [], "references": []}

    refs = set(parsed.get("references", []))
    if intent == "search_products": refs.add("tool:search_products")
    if intent == "order_history":   refs.add("tool:order_history_by_email")
    parsed["references"] = sorted(refs)
    parsed.setdefault("products", [])
    parsed.setdefault("orders", [])
    # parsed.setdefault("follow_up", [])

    return parsed
