import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const PostMentorshipSchema = z.object({
  mentorId: z.string().min(1),
  topic: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PostMentorshipSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { mentorId, topic } = parsed.data;

  if (mentorId === session.userId) {
    return Response.json({ error: "Cannot request mentorship from yourself" }, { status: 400 });
  }

  try {
    const mentorship = await prisma.mentorship.create({
      data: { mentorId, menteeId: session.userId, topic, status: "PENDING" },
    });
    return Response.json(mentorship, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json({ error: "Request already sent" }, { status: 409 });
    }
    throw err;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const mentorships = await prisma.mentorship.findMany({
    where: {
      OR: [{ mentorId: session.userId }, { menteeId: session.userId }],
    },
    include: {
      mentor: { select: { id: true, name: true, avatarUrl: true } },
      mentee: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const incoming = mentorships.filter(
    (m) => m.mentorId === session.userId && m.status === "PENDING"
  );
  const outgoing = mentorships.filter(
    (m) => m.menteeId === session.userId && m.status === "PENDING"
  );
  const active = mentorships.filter(
    (m) =>
      m.status === "ACTIVE" && (m.mentorId === session.userId || m.menteeId === session.userId)
  );

  return Response.json({ incoming, outgoing, active });
}
