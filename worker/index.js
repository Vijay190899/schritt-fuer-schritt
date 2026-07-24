/* =========================================================================
   Lumikuttan Worker, a tiny, safe proxy to OpenRouter.
   The API key lives ONLY here (as a Cloudflare secret), never in the website.

   Built-in safeguards:
     • Defaults to a FREE OpenRouter model for normal questions.
     • Hard cap on output length (max_tokens) keeps usage small.
     • Trims the incoming context so prompts stay short.
     • Only answers German-learning questions (focused system prompt).
   ========================================================================= */

const FREE_MODEL = "meta-llama/llama-3.3-70b-instruct:free"; // free tier
const PAID_MODEL = "anthropic/claude-3.5-haiku";             // optional, if you set MODEL

const SYSTEM_PROMPT = `You are Lumikuttan, a warm, patient German teacher preparing an adult learner for the B1 "Deutsch-Test für Zuwanderer" (DTZ).
Rules:
- Answer ONLY questions about the German language, grammar, vocabulary, or the DTZ/B1 exam. If asked anything else, gently steer back to German.
- Be accurate. If unsure, say so plainly, never invent grammar rules.
- Keep answers SHORT (max ~120 words). Give one clear rule + one example.
- Explain in simple English AND give the German example. Be encouraging.
- Use the learner's current lesson context if provided.`;

const cors = {
  "Access-Control-Allow-Origin": "*",           // tighten to your Pages URL if you like
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return json({ error: "POST only" }, 405);

    if (!env.OPENROUTER_API_KEY)
      return json({ error: "Worker not configured: set OPENROUTER_API_KEY secret." }, 500);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }

    const question = String(body.question || "").slice(0, 500);
    const context  = String(body.context  || "").slice(0, 300);
    if (!question) return json({ error: "no question" }, 400);

    const model = (env.MODEL && env.MODEL.trim()) || FREE_MODEL;

    const payload = {
      model,
      max_tokens: 260,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + (context ? `\nLesson context: ${context}` : "") },
        { role: "user", content: question },
      ],
    };

    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://schritt-fuer-schritt",
          "X-Title": "Schritt fuer Schritt",
        },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) return json({ error: data.error?.message || "openrouter error" }, 502);
      const answer = data.choices?.[0]?.message?.content?.trim() || "…";
      return json({ answer, model });
    } catch (e) {
      return json({ error: "upstream failed" }, 502);
    }
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
