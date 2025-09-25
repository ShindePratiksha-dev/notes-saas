import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    const { slug } = req.query;
    const tenant = await prisma.tenant.update({
      where: { slug },
      data: { plan: "PRO" },
    });

    res.status(200).json({ message: `Tenant ${slug} upgraded to PRO` });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
