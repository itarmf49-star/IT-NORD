import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type SocketServer = HTTPServer & {
  io?: IOServer;
};

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: SocketServer;
  };
};

const LOBBY_THREAD_ID = "public-lobby";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket?.server?.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const now = new Date().toISOString();
      await supabase.from("chat_threads").upsert(
        { id: LOBBY_THREAD_ID, title: "Public lobby", created_at: now, updated_at: now },
        { onConflict: "id" },
      );
    }

    io.on("connection", async (socket) => {
      socket.join(LOBBY_THREAD_ID);

      let history: { id: string; body: string; createdAt: string }[] = [];

      if (supabase) {
        const { data: recent } = await supabase
          .from("chat_messages")
          .select("id, body, created_at")
          .eq("thread_id", LOBBY_THREAD_ID)
          .order("created_at", { ascending: false })
          .limit(50);

        history =
          (recent ?? [])
            .reverse()
            .map((m) => ({
              id: m.id as string,
              body: m.body as string,
              createdAt: new Date(m.created_at as string).toISOString(),
            })) ?? [];
      }

      socket.emit("chat:history", history);

      socket.on("chat:message", async (payload: { body?: string }) => {
        const body = (payload?.body ?? "").trim();
        if (!body || !supabase) return;

        const id = randomUUID();
        const { data: saved, error } = await supabase
          .from("chat_messages")
          .insert({
            id,
            thread_id: LOBBY_THREAD_ID,
            body,
            is_ai: false,
          })
          .select("id, body, created_at")
          .single();

        if (error || !saved) return;

        io.to(LOBBY_THREAD_ID).emit("chat:message", {
          id: saved.id,
          body: saved.body,
          createdAt: new Date(saved.created_at as string).toISOString(),
        });
      });
    });
  }

  res.status(200).end();
}
