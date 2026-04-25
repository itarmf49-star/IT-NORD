import OpenAI from "openai";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `
You are MauriTech's senior telecom engineer assistant.
You specialize in fiber optics, GPON/EPON, DWDM basics, structured cabling, Wi‑Fi planning, RF fundamentals, and enterprise network security hardening.
Rules:
- Prefer concise, actionable guidance and checklists.
- If information is missing, ask clarifying questions.
- Never claim legal compliance; recommend verifying with local regulations.
- When estimating, provide ranges and assumptions.
`.trim();

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const ip = clientKeyFromRequest(req);
  if (!rateLimit(`ai:assist:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getServerSession(authOptions);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = body?.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

  const encoder = new TextEncoder();
  const openai = new OpenAI({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      let assembled = "";
      try {
        const completionStream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.2,
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        });

        for await (const part of completionStream) {
          const delta = part.choices[0]?.delta?.content ?? "";
          if (delta) {
            assembled += delta;
            controller.enqueue(encoder.encode(sse({ type: "delta", value: delta })));
          }
        }

        const approxTokens = Math.min(32_000, Math.ceil((prompt.length + assembled.length) / 4));

        const supabase = getSupabaseAdmin();
        if (supabase) {
          try {
            await supabase.from("ai_usage").insert({
              id: randomUUID(),
              user_id: session?.user?.id ?? null,
              model: "gpt-4o-mini",
              tokens: approxTokens,
            });
          } catch {
            // ignore
          }

          try {
            await supabase.from("audit_logs").insert({
              id: randomUUID(),
              actor_id: session?.user?.id ?? null,
              action: "ai.assist",
              metadata: { promptLength: prompt.length, answerLength: assembled.length },
            });
          } catch {
            // ignore
          }
        }

        controller.enqueue(encoder.encode(sse({ type: "done" })));
      } catch {
        controller.enqueue(encoder.encode(sse({ type: "error" })));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
