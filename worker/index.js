/* =========================================================================
   Lumikuttan Worker, powered by Cloudflare Workers AI (open-source models).

   Runs an open-weight LLM (Llama / Mistral / Qwen) on Cloudflare's edge.
   No API key needed: the "AI" binding is provided by Cloudflare.
   Free tier: ~10,000 neurons/day, plenty for one learner.

   Lumikuttan is a GENERAL assistant: it answers everyday questions too,
   not only German ones. For German questions it uses the "context" the
   website sends (verified grammar notes) so it stays accurate.
   ========================================================================= */

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";  // balanced, multilingual

const SYSTEM = `You are Lumikuttan, a warm and encouraging owl. You are the study companion of an adult who is preparing for the German B1 exam "Deutsch-Test für Zuwanderer" (DTZ), but you are also a general helper.

How to answer:
- Answer ANY question helpfully and briefly, not only German ones.
- When the question is about German (grammar, vocabulary, the exam), be accurate and concrete: give one clear rule and a short German example. Never invent grammar rules; if you are unsure, say so honestly.
- If "Context" is provided below, use it, it contains verified notes.
- Keep replies warm and fairly short (2 to 5 sentences).
- Reply in the same language the user writes in (English or German).
- If the user sounds stressed or nervous, add a short, kind word of encouragement.`;

const cors = {
  "Access-Control-Allow-Origin": "*",           // tighten to your Pages URL if you like
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);
    if (!env.AI) return json({ error: "Workers AI binding missing (add [ai] binding = \"AI\")." }, 500);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }

    const question = String(body.question || "").slice(0, 1000);
    const context  = String(body.context  || "").slice(0, 1800);
    if (!question) return json({ error: "no question" }, 400);

    const model = (env.MODEL && env.MODEL.trim()) || DEFAULT_MODEL;

    const messages = [
      { role: "system", content: SYSTEM + (context ? `\n\nContext:\n${context}` : "") },
    ];
    // short conversation memory for natural follow-ups
    if (Array.isArray(body.history)) {
      for (const m of body.history.slice(-6)) {
        if (m && (m.role === "user" || m.role === "assistant") && m.content)
          messages.push({ role: m.role, content: String(m.content).slice(0, 800) });
      }
    }
    messages.push({ role: "user", content: question });

    try {
      const r = await env.AI.run(model, { messages, max_tokens: 320, temperature: 0.4 });
      const answer = (r && r.response ? r.response : "").trim() || "…";
      return json({ answer, model });
    } catch (e) {
      return json({ error: "inference failed", detail: String(e && e.message || e) }, 502);
    }
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
