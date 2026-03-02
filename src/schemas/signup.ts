import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1, "Nome obrigatório"),
    email: z.email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "Confirmação deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });
