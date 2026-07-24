/*
  Schritt für Schritt, configuration
  ------------------------------------
  This is the only file you normally touch after the first deploy.

  MASCOT_WORKER_URL:
    Leave it as "" and Lumikuttan still works in "offline mode": free, no
    server, answering common German-grammar questions and giving encouragement
    from the built-in knowledge base.

    Paste your Worker URL here to switch on the AI BRAIN. Then Lumikuttan
    becomes a general assistant (open-source LLM on Cloudflare Workers AI) and
    can answer normal questions too, not only German ones. No API key is
    involved; the model runs on Cloudflare's edge.
    Example: "https://lumikuttan.<your-subdomain>.workers.dev"
    Deploy steps: see /worker/README.md
*/
window.SFS_CONFIG = {
  MASCOT_WORKER_URL: "https://lumikuttan.vijayananthyt.workers.dev",   // AI brain (Cloudflare Workers AI)
  APP_VERSION: "1.2.0",
  DEEP_ANSWER_ENABLED: true,      // set false to force offline mode even if a URL is set
  PASS_THRESHOLD: 0.70,           // 70% to unlock the next step
  QUESTIONS_PER_QUIZ: 7           // questions drawn from each bank per attempt
};
