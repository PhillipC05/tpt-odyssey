"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShareQuestButtonProps {
  questId: string;
  shareId: string | null;
}

export function ShareQuestButton({ questId, shareId: initialShareId }: ShareQuestButtonProps) {
  const [shareId, setShareId] = useState(initialShareId);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/quests/${questId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share: !shareId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setShareId(data.shareId ?? null);

      if (data.shareId) {
        const url = `${window.location.origin}/q/${data.shareId}`;
        await navigator.clipboard.writeText(url).catch(() => {});
        toast.success("Quest is now public! Link copied.");
      } else {
        toast.success("Quest is now private.");
      }
    } catch {
      toast.error("Failed to update sharing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={isLoading} className="gap-2 shrink-0">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : shareId ? (
        <Link2 className="h-4 w-4 text-primary" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {shareId ? "Shared" : "Share"}
    </Button>
  );
}
