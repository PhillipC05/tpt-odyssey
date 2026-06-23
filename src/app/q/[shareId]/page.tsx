import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Compass, CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const quest = await prisma.quest.findUnique({ where: { shareId } });
  return {
    title: quest ? `${quest.title} — TPT Odyssey` : "Quest — TPT Odyssey",
    description: quest?.narrative,
  };
}

export default async function PublicQuestPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const quest = await prisma.quest.findUnique({
    where: { shareId },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      milestones: {
        orderBy: { order: "asc" },
        include: {
          checkIn: { select: { summary: true, moodScore: true, flowScore: true } },
        },
      },
    },
  });

  if (!quest) notFound();

  const completed = quest.milestones.filter((m) => m.status === "COMPLETED").length;
  const total = quest.milestones.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 bg-background/90 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
            <Compass className="h-4 w-4 text-primary" />
            TPT Odyssey
          </Link>
          <Button size="sm" asChild>
            <Link href="/sign-up">Begin your own quest</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {quest.user.avatarUrl && <AvatarImage src={quest.user.avatarUrl} />}
            <AvatarFallback>{quest.user.name?.[0] ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <span className="text-muted-foreground">{quest.user.name ?? "A traveler"}&apos;s quest</span>
          </div>
        </div>

        {/* Quest header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">{quest.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{quest.narrative}</p>

          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completed} of {total} milestones</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Milestones timeline */}
        <div className="space-y-4">
          {quest.milestones.map((milestone) => {
            const isDone = milestone.status === "COMPLETED";
            const isActive = milestone.status === "IN_PROGRESS";

            return (
              <div
                key={milestone.id}
                className={`rounded-xl border p-5 space-y-3 ${
                  isDone ? "border-emerald-200/50 bg-emerald-50/30" : isActive ? "border-primary/30" : "border-border/40 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : isActive ? (
                    <Circle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{milestone.title}</h3>
                      {isDone && <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Complete</Badge>}
                      {isActive && <Badge className="text-xs">In progress</Badge>}
                      {milestone.estimatedDays && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />~{milestone.estimatedDays}d
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {isDone && milestone.checkIn && (
                  <div className="ml-8 p-3 rounded-lg bg-background/80 border border-border/50 text-sm">
                    <p className="text-muted-foreground italic">&ldquo;{milestone.checkIn.summary}&rdquo;</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Mood: {milestone.checkIn.moodScore}/10</span>
                      <span>Flow: {milestone.checkIn.flowScore}/10</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pt-6 border-t border-border/40">
          <p className="text-muted-foreground text-sm mb-4">
            Inspired? Start your own journey.
          </p>
          <Button asChild>
            <Link href="/sign-up">Begin your quest with Odyssey</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
