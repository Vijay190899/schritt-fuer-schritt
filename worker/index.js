/* =========================================================================
   Lumikuttan Worker, powered by Cloudflare Workers AI (open-source models).

   Runs an open-weight LLM (Llama) on Cloudflare's edge.
   No API key needed: the "AI" binding is provided by Cloudflare.
   Free tier: ~10,000 neurons/day, plenty for one learner.

   Lumikuttan is a GENERAL assistant: it answers everyday questions too,
   not only German ones. For German questions it uses the "context" the
   website sends (verified grammar notes) so it stays accurate.

   Resilience: it tries a list of current models in order and falls back to
   the next one if a model is deprecated/unavailable, so it keeps working
   even when Cloudflare retires a model.
   ========================================================================= */

// Ordered by preference. First that works wins. (All open-weight, all verified
// present in the account's live model catalog via `wrangler ai models`.)
const MODELS = [
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",     // best quality, multilingual
  "@cf/mistralai/mistral-small-3.1-24b-instruct", // strong multilingual fallback
  "@cf/meta/llama-3.2-3b-instruct",               // small, fast, always-works fallback
];

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

    const messages = [
      { role: "system", content: SYSTEM + (context ? `\n\nContext:\n${context}` : "") },
    ];
    if (Array.isArray(body.history)) {
      for (const m of body.history.slice(-6)) {
        if (m && (m.role === "user" || m.role === "assistant") && m.content)
          messages.push({ role: m.role, content: String(m.content).slice(0, 800) });
      }
    }
    messages.push({ role: "user", content: question });

    // Preferred model first (env.MODEL override), then the fallback list.
    const tryModels = [];
    if (env.MODEL && env.MODEL.trim()) tryModels.push(env.MODEL.trim());
    for (const m of MODELS) if (!tryModels.includes(m)) tryModels.push(m);

    let lastErr = "no model";
    for (const model of tryModels) {
      try {
        const r = await env.AI.run(model, { messages, max_tokens: 320, temperature: 0.4 });
        const answer = (r && r.response ? r.response : "").trim();
        if (answer) return json({ answer, model });
        lastErr = "empty response from " + model;
      } catch (e) {
        lastErr = String(e && e.message || e);
        // If it's a deprecation/not-found, keep trying the next model; otherwise stop.
        if (!/deprecat|not found|5028|7502|no such model/i.test(lastErr)) break;
      }
    }
    return json({ error: "inference failed", detail: lastErr }, 502);
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
