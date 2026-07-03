import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const PatchTaskSchema = z.object({
  taskId: z.string().min(1),
  completed: z.boolean(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchTaskSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { taskId, completed } = parsed.data;

  // Verify ownership via the task → milestone → quest → user chain
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      milestone: { quest: { userId: session.userId } },
    },
  });
  if (!task) return new Response("Not found", { status: 404 });

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { completed },
  });

  // Check if all tasks in the milestone are complete → auto-advance status
  const allTasks = await prisma.task.findMany({
    where: { milestoneId: task.milestoneId },
  });
  const allDone = allTasks.every((t) => (t.id === taskId ? completed : t.completed));

  if (allDone) {
    await prisma.milestone.update({
      where: { id: task.milestoneId },
      data: { status: "IN_PROGRESS" },
    });
  }

  return Response.json(updated);
}
