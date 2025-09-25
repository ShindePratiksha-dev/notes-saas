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
  try {
    const user = getUser(req);

    if (req.method === "GET") {
      const notes = await prisma.note.findMany({ where: { tenantId: user.tenantId } });
      return res.status(200).json(notes);
    }

    if (req.method === "POST") {
      const { title, content } = req.body;

      // Check FREE plan limit
      const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId }, include: { notes: true } });
      if (tenant.plan === "FREE" && tenant.notes.length >= 3) {
        return res.status(403).json({ error: "Upgrade to Pro" });
      }

      const note = await prisma.note.create({
        data: { title, content, tenantId: user.tenantId, userId: user.userId },
      });
      return res.status(201).json(note);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
