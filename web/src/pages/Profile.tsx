import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useAuthStore } from "../stores/authStore";
import { useToast } from "../hooks/useToast";
import type { UserProfile } from "../types/User";
import type { Timestamp } from "firebase/firestore";

const formatCreatedAt = (
  createdAt: UserProfile["createdAt"] | undefined,
): string => {
  if (!createdAt) return "—";
  const ts = createdAt as Timestamp;
  const date =
    typeof ts.toDate === "function"
      ? ts.toDate()
      : new Date(createdAt as unknown as string);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const roleLabel: Record<NonNullable<UserProfile["role"]>, string> = {
  admin: "Administrador",
  user: "Usuário",
};

export const Profile = () => {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = () => {
    setName(profile?.name ?? "");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      showToast({ message: "Perfil atualizado.", type: "success" });
      handleClose();
    } catch {
      showToast({ message: "Erro ao atualizar perfil.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Perfil</Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleOpenEdit}
          disabled={!profile}
        >
          Editar nome
        </Button>
      </Box>

      <Card variant="outlined" sx={{ maxWidth: 480 }}>
        <CardContent>
          <List dense disablePadding>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Nome"
                secondary={profile?.name ?? "—"}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="E-mail"
                secondary={user.email ?? "—"}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
            {profile?.role && (
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Função"
                  secondary={roleLabel[profile.role]}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            )}
            {profile?.companyId && (
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="ID da empresa"
                  secondary={profile.companyId}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            )}
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Conta criada em"
                secondary={formatCreatedAt(profile?.createdAt ?? undefined)}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar perfil</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!name.trim() || saving}
          >
            {saving ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
