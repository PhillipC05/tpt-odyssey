import { z } from "zod";

export const ProfileSchema = z.object({
  summary: z.string(),
  interests: z.array(z.string()),
  psychAttributes: z.object({
    openness: z.number().min(1).max(10),
    conscientiousness: z.number().min(1).max(10),
    extraversion: z.number().min(1).max(10),
    agreeableness: z.number().min(1).max(10),
    neuroticism: z.number().min(1).max(10),
    curiosityType: z.enum(["explorer", "builder", "connector", "analyst", "creator"]),
    motivationStyle: z.enum(["mastery", "purpose", "autonomy", "connection"]),
  }),
  talentSignals: z.array(z.string()),
});

export type ProfileData = z.infer<typeof ProfileSchema>;

export const ResourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.enum(["VIDEO", "ARTICLE", "COURSE", "COMMUNITY", "TOOL"]),
  description: z.string().optional(),
});

export const TaskSchema = z.object({
  title: z.string(),
  order: z.number(),
});

export const MilestoneSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  estimatedDays: z.number().optional(),
  tasks: z.array(TaskSchema),
  resources: z.array(ResourceSchema),
});

export const QuestSchema = z.object({
  title: z.string(),
  narrative: z.string(),
  milestones: z.array(MilestoneSchema).min(3).max(7),
});

export type QuestData = z.infer<typeof QuestSchema>;

export const CheckInResultSchema = z.object({
  moodScore: z.number().min(1).max(10),
  flowScore: z.number().min(1).max(10),
  engagementScore: z.number().min(1).max(10),
  summary: z.string(),
  shouldAdapt: z.boolean(),
  adaptationReason: z.string().optional(),
});

export type CheckInResult = z.infer<typeof CheckInResultSchema>;

export const AdaptedQuestSchema = z.object({
  milestones: z.array(MilestoneSchema).min(1).max(7),
  adaptationNote: z.string(),
});

export type AdaptedQuestData = z.infer<typeof AdaptedQuestSchema>;
