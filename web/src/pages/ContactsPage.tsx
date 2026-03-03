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
import { useContactStore } from "../stores/contactStore";
import { useToast } from "../hooks/useToast";

export const ContactsPage = () => {
  const user = useAuthStore((s) => s.user);
  const selectedConnectionId = useConnectionStore(
    (s) => s.selectedConnectionId,
  );
  const { showToast } = useToast();
  const { contacts, loading, createContact, updateContact, deleteContact } =
    useContactStore();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleOpenCreate = () => {
    if (!selectedConnectionId) {
      showToast({
        message: "Selecione uma conexão no topo da página.",
        type: "warning",
      });
      return;
    }
    setEditingId(null);
    setName("");
    setPhone("");
    setOpen(true);
  };

  const handleOpenEdit = (
    id: string,
    currentName: string,
    currentPhone: string,
  ) => {
    setEditingId(id);
    setName(currentName);
    setPhone(currentPhone);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setName("");
    setPhone("");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !user?.uid || !selectedConnectionId)
      return;
    try {
      if (editingId) {
        await updateContact(editingId, {
          name: name.trim(),
          phone: phone.trim(),
        });
        showToast({ message: "Contato atualizado.", type: "success" });
      } else {
        await createContact(
          user.uid,
          selectedConnectionId,
          name.trim(),
          phone.trim(),
        );
        showToast({ message: "Contato criado.", type: "success" });
      }
      handleClose();
    } catch {
      showToast({ message: "Erro ao salvar contato.", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir este contato?")) return;
    try {
      await deleteContact(id);
      showToast({ message: "Contato excluído.", type: "success" });
    } catch {
      showToast({ message: "Erro ao excluir contato.", type: "error" });
    }
  };

  if (!selectedConnectionId) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Contatos
        </Typography>
        <Typography color="text.secondary">
          Selecione uma conexão no menu superior para gerenciar os contatos.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Contatos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Novo contato
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : contacts.length === 0 ? (
        <Typography color="text.secondary">
          Nenhum contato nesta conexão. Crie um para começar.
        </Typography>
      ) : (
        <List>
          {contacts.map((c) => (
            <ListItem key={c.id} divider>
              <ListItemText primary={c.name} secondary={c.phone} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenEdit(c.id, c.name, c.phone)}
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
          {editingId ? "Editar contato" : "Novo contato"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Telefone"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim() || !phone.trim()}
          >
            {editingId ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
