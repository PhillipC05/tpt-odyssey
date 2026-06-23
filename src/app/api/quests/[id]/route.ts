import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  const quest = await prisma.quest.findFirst({
    where: { id, userId: session.userId },
    include: {
      milestones: {
        orderBy: { order: "asc" },
        include: {
          tasks: { orderBy: { order: "asc" } },
          resources: true,
          checkIn: true,
        },
      },
    },
  });

  if (!quest) return new Response("Not found", { status: 404 });
  return Response.json(quest);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const { status, share } = body;

  const quest = await prisma.quest.findFirst({ where: { id, userId: session.userId } });
  if (!quest) return new Response("Not found", { status: 404 });

  const updated = await prisma.quest.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(share === true && { shareId: quest.shareId ?? nanoid(10) }),
      ...(share === false && { shareId: null }),
    },
  });

  return Response.json(updated);
}
