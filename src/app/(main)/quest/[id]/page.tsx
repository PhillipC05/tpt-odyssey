import { getSession } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { TaskItem } from "@/components/quest/TaskItem";
import { ResourceCard } from "@/components/quest/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, ArrowRight, Share2 } from "lucide-react";
import { CompleteMilestoneButton } from "@/components/quest/CompleteMilestoneButton";
import { ShareQuestButton } from "@/components/quest/ShareQuestButton";

export default async function QuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/sign-in");

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

  if (!quest) notFound();

  const completed = quest.milestones.filter((m) => m.status === "COMPLETED").length;
  const total = quest.milestones.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Quest header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Quests
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm truncate">{quest.title}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight mb-2">{quest.title}</h1>
            <p className="text-muted-foreground leading-relaxed">{quest.narrative}</p>
          </div>
          <ShareQuestButton questId={quest.id} shareId={quest.shareId} />
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completed} of {total} milestones complete</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Separator />

      {/* Milestones */}
      <div className="space-y-6">
        {quest.milestones.map((milestone, idx) => {
          const isActive = milestone.status === "IN_PROGRESS";
          const isDone = milestone.status === "COMPLETED";
          const isLocked = milestone.status === "PENDING" && idx > 0;
          const allTasksDone = milestone.tasks.every((t) => t.completed);

          return (
            <div
              key={milestone.id}
              className={`rounded-2xl border p-5 space-y-4 transition-all ${
                isActive
                  ? "border-primary/40 bg-primary/[0.02] shadow-sm"
                  : isDone
                  ? "border-border/40 opacity-70"
                  : "border-border/40"
              }`}
            >
              {/* Milestone header */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : isActive ? (
                    <Circle className="h-5 w-5 text-primary animate-pulse" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{milestone.title}</h3>
                    {isDone && <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Done</Badge>}
                    {isActive && <Badge className="text-xs">In progress</Badge>}
                    {milestone.estimatedDays && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ~{milestone.estimatedDays}d
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Tasks */}
              {!isLocked && milestone.tasks.length > 0 && (
                <div className="pl-8 space-y-0.5">
                  {milestone.tasks.map((task) => (
                    <TaskItem key={task.id} task={task} disabled={isDone} />
                  ))}
                </div>
              )}

              {/* Resources */}
              {!isLocked && milestone.resources.length > 0 && (
                <div className="pl-8 space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Resources
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {milestone.resources.map((r) => (
                      <ResourceCard key={r.id} resource={r} />
                    ))}
                  </div>
                </div>
              )}

              {/* Complete button */}
              {isActive && allTasksDone && (
                <div className="pl-8 pt-2">
                  <CompleteMilestoneButton
                    milestoneId={milestone.id}
                    questId={quest.id}
                  />
                </div>
              )}

              {/* Check-in summary if done */}
              {isDone && milestone.checkIn && (
                <div className="pl-8 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Reflection:</span>{" "}
                  {milestone.checkIn.summary}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
