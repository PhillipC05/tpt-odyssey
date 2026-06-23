import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  status: string;
  order: number;
}

interface QuestCardProps {
  quest: {
    id: string;
    title: string;
    narrative: string;
    status: string;
    milestones: Milestone[];
  };
}

export function QuestCard({ quest }: QuestCardProps) {
  const completed = quest.milestones.filter((m) => m.status === "COMPLETED").length;
  const total = quest.milestones.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const current = quest.milestones.find((m) => m.status === "IN_PROGRESS");

  return (
    <Link href={`/quest/${quest.id}`} className="block group">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
              {quest.title}
            </CardTitle>
            <Badge
              variant={quest.status === "COMPLETED" ? "default" : "secondary"}
              className="shrink-0 text-xs"
            >
              {quest.status === "COMPLETED" ? "Complete" : quest.status === "ABANDONED" ? "Abandoned" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {quest.narrative}
          </p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completed} of {total} milestones</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {current && (
            <div className="flex items-center gap-2 text-sm pt-1">
              <Circle className="h-3.5 w-3.5 text-primary animate-pulse shrink-0" />
              <span className="text-muted-foreground truncate">
                Currently: {current.title}
              </span>
            </div>
          )}

          {quest.status === "COMPLETED" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Quest complete!</span>
            </div>
          )}

          <div className="flex items-center justify-end text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View quest <ArrowRight className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
