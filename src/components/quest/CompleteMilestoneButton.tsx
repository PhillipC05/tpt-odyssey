"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompleteMilestoneButtonProps {
  milestoneId: string;
  questId: string;
}

export function CompleteMilestoneButton({ milestoneId, questId }: CompleteMilestoneButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();

      toast.success("Milestone complete! Time for a check-in.");
      router.push(`/quest/${questId}/check-in?milestoneId=${milestoneId}`);
    } catch {
      toast.error("Failed to complete milestone");
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleComplete} disabled={isLoading} className="gap-2">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      Mark milestone complete
    </Button>
  );
}
