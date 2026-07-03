import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const PatchMentorshipSchema = z.object({
  status: z.enum(["ACTIVE", "ENDED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchMentorshipSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { status } = parsed.data;

  const mentorship = await prisma.mentorship.findUnique({ where: { id } });
  if (!mentorship) return new Response("Not found", { status: 404 });

  const isMentor = mentorship.mentorId === session.userId;
  const isMentee = mentorship.menteeId === session.userId;
  if (!isMentor && !isMentee) return new Response("Forbidden", { status: 403 });

  if (mentorship.status === "PENDING") {
    // Only the mentor may accept or decline a pending request.
    if (!isMentor) return new Response("Forbidden", { status: 403 });
  } else if (mentorship.status === "ACTIVE") {
    // Either party may end an active mentorship.
    if (status !== "ENDED") return Response.json({ error: "Invalid transition" }, { status: 400 });
  } else {
    return Response.json({ error: "Mentorship already ended" }, { status: 400 });
  }

  const updated = await prisma.mentorship.update({
    where: { id },
    data: { status },
  });

  return Response.json(updated);
}
