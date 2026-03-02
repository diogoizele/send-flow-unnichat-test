import { Button, TextField, Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import type z from "zod";

import { loginSchema } from "../schemas/login";
import { useAuthStore } from "../stores/authStore";
import { useToast } from "../hooks/useToast";

export const Login = () => {
  const { showToast } = useToast();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const result = await login(data.email, data.password);

      console.log({ result });
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.log({ error });
        switch (error.code) {
          case "auth/invalid-credential":
            showToast({ message: "Email ou senha inválidos", type: "error" });
            break;
          default:
            showToast({
              message: "Erro no servidor. Tente novamente mais tarde",
              type: "error",
            });
        }
      } else {
        showToast({
          message: "Erro desconhecido. Tente novamente",
          type: "error",
        });
      }
    }
  };

  return (
    <Box
      width="100vw"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <Typography variant="h4">SendFlow/Unnichat Test</Typography>
      <Typography variant="h6">Faça login para continuar</Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        display="flex"
        flexDirection="column"
        gap={2}
        width="300px"
      >
        <TextField
          label="Nome de usuário"
          {...register("email")}
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Senha"
          type="password"
          {...register("password")}
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Carregando..." : "Entrar"}
        </Button>
        <Button type="button" variant="outlined" component={Link} to="/signup">
          Criar conta
        </Button>
      </Box>
    </Box>
  );
};
