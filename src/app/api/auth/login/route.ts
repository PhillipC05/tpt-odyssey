import { prisma } from "@/lib/db";
import { createToken, setSessionCookie } from "@/lib/auth/session";
import bcrypt from "bcryptjs";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createToken(user.id, user.email);
  await setSessionCookie(token);

  return Response.json({ userId: user.id });
}
