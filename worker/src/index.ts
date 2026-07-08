// OpenAI-compatible shim over Cloudflare Workers AI.
//
// POST /chat/completions with the usual { model, messages, max_tokens,
// temperature } body and an `Authorization: Bearer <AUTH_TOKEN>` header, and it
// returns the OpenAI shape { choices: [{ message: { content } }] } so
// scripts/issue-to-cards.ts consumes it unchanged — point LLM_BASE_URL at this
// Worker's URL.
//
// The AUTH_TOKEN secret gates access (this Worker spends your Neurons). Set it
// once with: pnpm worker:secret
//
// Types are loose on purpose so the worker builds via wrangler's esbuild
// without pulling @cloudflare/workers-types into the main project.

interface Env {
  AI: { run: (model: string, input: unknown) => Promise<{ response?: string }> };
  AUTH_TOKEN?: string;
}

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return json({ ok: true, service: "vox-card-llm", model: DEFAULT_MODEL });
    }
    if (request.method !== "POST" || !url.pathname.endsWith("/chat/completions")) {
      return json({ error: { message: "Not found" } }, 404);
    }

    if (env.AUTH_TOKEN) {
      const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
      if (token !== env.AUTH_TOKEN) return json({ error: { message: "Unauthorized" } }, 401);
    }

    let req: { model?: string; messages?: { role: string; content: string }[]; max_tokens?: number; temperature?: number };
    try {
      req = await request.json();
    } catch {
      return json({ error: { message: "Invalid JSON body" } }, 400);
    }

    const messages = req.messages ?? [];
    if (messages.length === 0) return json({ error: { message: "messages is required" } }, 400);

    // Only honour Cloudflare model ids (@cf/...); anything else (e.g. a Groq id)
    // falls back to the default so callers don't have to know CF naming.
    const model = req.model && req.model.startsWith("@cf/") ? req.model : DEFAULT_MODEL;

    try {
      const result = await env.AI.run(model, {
        messages,
        max_tokens: req.max_tokens ?? 2000,
        temperature: req.temperature ?? 0.2,
      });
      const content = typeof result.response === "string" ? result.response : JSON.stringify(result);
      return json({ model, choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }] });
    } catch (e) {
      return json({ error: { message: `Workers AI error: ${(e as Error).message}` } }, 502);
    }
  },
};
