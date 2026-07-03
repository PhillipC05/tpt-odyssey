"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, HandHeart } from "lucide-react";
import { toast } from "sonner";

interface RequestMentorshipButtonProps {
  mentorId: string;
  topic: string;
}

export function RequestMentorshipButton({ mentorId, topic }: RequestMentorshipButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const request = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/mentorships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, topic }),
      });
      if (res.status === 409) {
        toast.info("You've already requested mentorship on this topic");
        setSent(true);
        return;
      }
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success("Mentorship request sent");
    } catch {
      toast.error("Failed to send request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={request} disabled={isLoading || sent} className="gap-1.5">
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <HandHeart className="h-3.5 w-3.5" />
      )}
      {sent ? "Requested" : "Request mentorship"}
    </Button>
  );
}
