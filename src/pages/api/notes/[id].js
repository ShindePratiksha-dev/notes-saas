import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function getUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  const { id } = req.query;
  const user = getUser(req);

  try {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.tenantId !== user.tenantId) return res.status(404).json({ error: "Note not found" });

    if (req.method === "GET") return res.status(200).json(note);

    if (req.method === "PUT") {
      const { title, content } = req.body;
      const updated = await prisma.note.update({
        where: { id },
        data: { title, content },
      });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await prisma.note.delete({ where: { id } });
      return res.status(204).end();
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
