import { prisma } from "@/lib/db";
import { createToken, setSessionCookie } from "@/lib/auth/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

// Hash of a random value, used to keep bcrypt.compare's timing consistent
// whether or not the email exists, so responses can't be used to enumerate accounts.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing-parity", 12);

export async function POST(req: Request) {
  if (!rateLimit(`login:${getClientIp(req)}`, 10, 60_000)) {
    return Response.json({ error: "Too many attempts, try again later" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !valid) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createToken(user.id, user.email);
  await setSessionCookie(token);

  return Response.json({ userId: user.id });
}
