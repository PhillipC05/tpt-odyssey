"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MentorshipActionsProps {
  mentorshipId: string;
  variant: "incoming" | "active";
}

export function MentorshipActions({ mentorshipId, variant }: MentorshipActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const update = async (status: "ACTIVE" | "ENDED") => {
    setIsLoading(status);
    try {
      const res = await fetch(`/api/mentorships/${mentorshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Failed to update mentorship");
    } finally {
      setIsLoading(null);
    }
  };

  if (variant === "incoming") {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => update("ACTIVE")} disabled={isLoading !== null} className="gap-1.5">
          {isLoading === "ACTIVE" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => update("ENDED")} disabled={isLoading !== null} className="gap-1.5">
          {isLoading === "ENDED" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          Decline
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={() => update("ENDED")} disabled={isLoading !== null}>
      {isLoading === "ENDED" && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
      End mentorship
    </Button>
  );
}
