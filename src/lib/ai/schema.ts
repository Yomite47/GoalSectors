import { z } from 'zod';

// Action Payloads
const CreateTaskSchema = z.object({
  title: z.string(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
});

const CreateHabitSchema = z.object({
  title: z.string(),
  frequency: z.enum(['daily']).default('daily')
});

const CreateGoalPlanSchema = z.object({
  goal_id: z.string().uuid(),
  milestones: z.array(z.object({
    title: z.string(),
    target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").or(z.null())
  })),
  weekly_plan: z.array(z.object({
    week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
    focus: z.string()
  }))
});

const DeleteTaskSchema = z.object({
  task_title: z.string().describe("The exact title of the task to delete")
});

const DeleteHabitSchema = z.object({
  habit_title: z.string().describe("The exact title of the habit to delete")
});

const DeleteGoalSchema = z.object({
  goal_title: z.string().describe("The exact title of the goal to delete")
});

// Action Union
const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("CREATE_TASK"), payload: CreateTaskSchema }),
  z.object({ type: z.literal("CREATE_HABIT"), payload: CreateHabitSchema }),
  z.object({ type: z.literal("CREATE_GOAL_PLAN"), payload: CreateGoalPlanSchema }),
  z.object({ type: z.literal("DELETE_TASK"), payload: DeleteTaskSchema }),
  z.object({ type: z.literal("DELETE_HABIT"), payload: DeleteHabitSchema }),
  z.object({ type: z.literal("DELETE_GOAL"), payload: DeleteGoalSchema })
]);

// Top-level Response
export const CoachResponseSchema = z.object({
  assistant_message: z.string(),
  actions: z.array(ActionSchema).default([])
});

export type CoachResponse = z.infer<typeof CoachResponseSchema>;
export type CoachAction = z.infer<typeof ActionSchema>;

export function validateCoachResponse(json: any): { ok: boolean; data?: CoachResponse; error?: string } {
  const result = CoachResponseSchema.safeParse(json);
  if (result.success) {
    return { ok: true, data: result.data };
  } else {
    return { ok: false, error: result.error.message };
  }
}
