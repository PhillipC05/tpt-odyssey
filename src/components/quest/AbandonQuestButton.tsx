"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flag, Loader2, RotateCcw, Shuffle } from "lucide-react";
import { toast } from "sonner";

interface AbandonQuestButtonProps {
  questId: string;
}

type Action = "abandon" | "restart" | "pivot";

export function AbandonQuestButton({ questId }: AbandonQuestButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Action | null>(null);
  const router = useRouter();

  const run = async (action: Action) => {
    setPending(action);
    try {
      const res = await fetch(`/api/quests/${questId}/abandon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOpen(false);

      if (action === "pivot") {
        router.push(`/quest/${data.questId}`);
      } else if (action === "abandon") {
        router.push("/dashboard");
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" onClick={() => setOpen(true)}>
        <Flag className="h-3.5 w-3.5" />
        Abandon
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not feeling this quest?</DialogTitle>
            <DialogDescription>
              Choose what happens next. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={pending !== null}
              onClick={() => run("restart")}
            >
              {pending === "restart" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Restart from scratch
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={pending !== null}
              onClick={() => run("pivot")}
            >
              {pending === "pivot" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shuffle className="h-4 w-4" />
              )}
              Pivot to a new quest
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 text-destructive"
              disabled={pending !== null}
              onClick={() => run("abandon")}
            >
              {pending === "abandon" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flag className="h-4 w-4" />
              )}
              Just abandon it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
