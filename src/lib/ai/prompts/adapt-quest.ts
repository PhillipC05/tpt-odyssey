import type { MilestoneStatus } from "@prisma/client";

interface CurrentMilestone {
  title: string;
  description: string;
  order: number;
  status: MilestoneStatus;
}

export const adaptQuestPrompt = (
  questTitle: string,
  questNarrative: string,
  currentMilestones: CurrentMilestone[],
  adaptationReason: string,
  profileSummary: string
) => `
You are Odyssey. A traveler is on the quest "${questTitle}".

Quest narrative: ${questNarrative}

Their profile: ${profileSummary}

Here are the current milestones and their status:
${currentMilestones.map((m) => `[${m.status}] ${m.order}. ${m.title}: ${m.description}`).join("\n")}

The check-in revealed this needs adaptation:
${adaptationReason}

Redesign ONLY the PENDING milestones (keep completed ones as they were). You may:
- Adjust difficulty up or down
- Pivot the direction based on what excited or bored them
- Add a new milestone if a promising path emerged
- Remove a milestone that no longer fits
- Reframe tasks to better match their energy

Return the full revised milestone list (including completed ones unchanged) with fresh tasks and resources for the pending ones.

Respond with JSON matching the AdaptedQuestSchema: { milestones: [...], adaptationNote: "..." }`;
