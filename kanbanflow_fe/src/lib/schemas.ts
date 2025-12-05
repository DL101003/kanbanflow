import { z } from "zod"

export const createCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.date().optional(), // Zod làm việc với Date object native, ngon hơn momentjs của Antd
})

export type CreateCardValues = z.infer<typeof createCardSchema>