/*
  Schritt für Schritt, configuration
  ------------------------------------
  This is the only file you normally touch after the first deploy.

  MASCOT_WORKER_URL:
    Leave it as "" and the mascot (Lumikuttan the owl) still works fully in
    "grounded mode": free, offline, no API key. It answers from the built-in
    German knowledge base, gives hints, and encourages.

    When you deploy the Cloudflare Worker, paste its URL here
    (e.g. "https://lumikuttan.<your-subdomain>.workers.dev"). That unlocks
    the optional "Deep answer" button, which routes questions through the
    Worker. Your API key stays secret inside the Worker, never in this repo.
*/
window.SFS_CONFIG = {
  MASCOT_WORKER_URL: "",          // paste your Worker URL here after deploy
  APP_VERSION: "1.0.0",
  DEEP_ANSWER_ENABLED: true,      // set false to hide the AI upgrade button entirely
  PASS_THRESHOLD: 0.70,           // 70% to unlock the next step
  QUESTIONS_PER_QUIZ: 7           // questions drawn from each bank per attempt
};
