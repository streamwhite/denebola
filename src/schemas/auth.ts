import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;
export const loginSchema = z.object({ email: z.string().email("invalid_email"), password: z.string().min(MIN_PASSWORD_LENGTH, "password_too_short") });
export type LoginInput = z.infer<typeof loginSchema>;
