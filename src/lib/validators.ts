import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const kathaSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    content: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type KathaFormValues = z.infer<typeof kathaSchema>;
