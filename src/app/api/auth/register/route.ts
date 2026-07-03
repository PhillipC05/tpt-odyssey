import { prisma } from "@/lib/db";
import { createToken, setSessionCookie } from "@/lib/auth/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  if (!rateLimit(`register:${getClientIp(req)}`, 5, 60_000)) {
    return Response.json({ error: "Too many attempts, try again later" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already in use" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hash, name: name ?? null },
  });

  const token = await createToken(user.id, user.email);
  await setSessionCookie(token);

  return Response.json({ userId: user.id }, { status: 201 });
}
