import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { prisma } from "@/lib/prisma";

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

    await prisma.chatThread.upsert({
      where: { id: LOBBY_THREAD_ID },
      update: {},
      create: { id: LOBBY_THREAD_ID, title: "Public lobby" },
    });

    io.on("connection", async (socket) => {
      socket.join(LOBBY_THREAD_ID);

      const recent = await prisma.chatMessage.findMany({
        where: { threadId: LOBBY_THREAD_ID },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      socket.emit(
        "chat:history",
        recent
          .reverse()
          .map((m) => ({ id: m.id, body: m.body, createdAt: m.createdAt.toISOString() })),
      );

      socket.on("chat:message", async (payload: { body?: string }) => {
        const body = (payload?.body ?? "").trim();
        if (!body) return;

        const saved = await prisma.chatMessage.create({
          data: {
            threadId: LOBBY_THREAD_ID,
            body,
          },
        });

        io.to(LOBBY_THREAD_ID).emit("chat:message", {
          id: saved.id,
          body: saved.body,
          createdAt: saved.createdAt.toISOString(),
        });
      });
    });
  }

  res.status(200).end();
}
