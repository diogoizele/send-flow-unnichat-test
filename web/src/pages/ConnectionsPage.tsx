import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuthStore } from "../stores/authStore";
import { useConnectionStore } from "../stores/connectionStore";
import { useToast } from "../hooks/useToast";

export const ConnectionsPage = () => {
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const {
    connections,
    loading,
    createConnection,
    updateConnection,
    deleteConnection,
  } = useConnectionStore();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setOpen(true);
  };

  const handleOpenEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setName(currentName);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setName("");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !user?.uid) return;
    try {
      if (editingId) {
        await updateConnection(editingId, name.trim());
        showToast({ message: "Conexão atualizada.", type: "success" });
      } else {
        await createConnection(user.uid, name.trim());
        showToast({ message: "Conexão criada.", type: "success" });
      }
      handleClose();
    } catch {
      showToast({ message: "Erro ao salvar conexão.", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir esta conexão?")) return;
    try {
      await deleteConnection(id);
      showToast({ message: "Conexão excluída.", type: "success" });
    } catch {
      showToast({ message: "Erro ao excluir conexão.", type: "error" });
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Conexões</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Nova conexão
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : connections.length === 0 ? (
        <Typography color="text.secondary">
          Nenhuma conexão. Crie uma para começar.
        </Typography>
      ) : (
        <List>
          {connections.map((c) => (
            <ListItem key={c.id} divider>
              <ListItemText primary={c.name} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenEdit(c.id, c.name)}
                  aria-label="editar"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(c.id)}
                  aria-label="excluir"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? "Editar conexão" : "Nova conexão"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim()}
          >
            {editingId ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
