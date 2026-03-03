import { Button, TextField, Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Timestamp } from "firebase/firestore";
import type z from "zod";

import { useAuthStore } from "../stores/authStore";
import { signupSchema } from "../schemas/signup";
import { Link } from "react-router-dom";

export const Signup = () => {
  const signup = useAuthStore((state) => state.register);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof signupSchema>) => {
    signup(data.email, data.password, {
      name: data.name,
      role: "user",
      createdAt: Timestamp.fromDate(new Date()),
    });
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
      <Typography variant="h6">Crie uma conta para continuar</Typography>
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
          {...register("name")}
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="E-mail"
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

        <TextField
          label="Confirme a Senha"
          type="password"
          {...register("confirmPassword")}
          fullWidth
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        {isSubmitting && <Typography>Carregando...</Typography>}
        <Button type="submit" variant="contained">
          Criar conta
        </Button>
        <Button type="button" variant="outlined" component={Link} to="/login">
          Já possui uma conta?
        </Button>
      </Box>
    </Box>
  );
};
