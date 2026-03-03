import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
} from "@mui/material";
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useAuthStore } from "../stores/authStore";
import { useConnectionStore } from "../stores/connectionStore";
import { useContactStore } from "../stores/contactStore";
import { useMessageStore } from "../stores/messageStore";
import { useToast } from "../hooks/useToast";
import type { Message } from "../types/Message";

type FilterTab = "all" | "sent" | "scheduled";

const statusLabel: Record<Message["status"], string> = {
  scheduled: "Agendada",
  sent: "Enviada",
  failed: "Falhou",
};

export const MessagesPage = () => {
  const user = useAuthStore((s) => s.user);
  const selectedConnectionId = useConnectionStore(
    (s) => s.selectedConnectionId,
  );
  const contacts = useContactStore((s) => s.contacts);
  const { showToast } = useToast();
  const { messages, loading, createMessage, deleteMessage } = useMessageStore();

  const [text, setText] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>(""); // datetime-local value (empty = send now)
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(
    new Set(),
  );
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  const filteredMessages = useMemo(() => {
    if (filterTab === "all") return messages;
    if (filterTab === "sent")
      return messages.filter(
        (m) => m.status === "sent" || m.status === "failed",
      );
    return messages.filter((m) => m.status === "scheduled");
  }, [messages, filterTab]);

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!text.trim() || !user?.uid || !selectedConnectionId) return;
    if (selectedContactIds.size === 0) {
      showToast({
        message: "Selecione pelo menos um contato.",
        type: "warning",
      });
      return;
    }
    try {
      const scheduleTime = scheduledAt ? new Date(scheduledAt).getTime() : null;
      if (scheduleTime && scheduleTime <= Date.now()) {
        showToast({
          message: "Data de agendamento deve ser no futuro.",
          type: "warning",
        });
        return;
      }
      await createMessage(
        user.uid,
        selectedConnectionId,
        Array.from(selectedContactIds),
        text.trim(),
        scheduleTime,
      );
      showToast({
        message: scheduleTime
          ? "Mensagem agendada."
          : "Mensagem enviada (simulado).",
        type: "success",
      });
      setText("");
      setScheduledAt("");
      setSelectedContactIds(new Set());
    } catch {
      showToast({ message: "Erro ao enviar/agendar mensagem.", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir esta mensagem?")) return;
    try {
      await deleteMessage(id);
      showToast({ message: "Mensagem excluída.", type: "success" });
    } catch {
      showToast({ message: "Erro ao excluir mensagem.", type: "error" });
    }
  };

  const formatDate = (ms: number) => {
    return new Date(ms).toLocaleString("pt-BR");
  };

  if (!selectedConnectionId) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Mensagens
        </Typography>
        <Typography color="text.secondary">
          Selecione uma conexão no menu superior para enviar e ver mensagens.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Enviar mensagem
      </Typography>

      <Box mb={3} p={2} sx={{ bgcolor: "background.default", borderRadius: 1 }}>
        <TextField
          label="Mensagem"
          multiline
          rows={3}
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          margin="normal"
        />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
          Selecione os contatos
        </Typography>
        <FormGroup row sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
          {contacts.map((c) => (
            <FormControlLabel
              key={c.id}
              control={
                <Checkbox
                  checked={selectedContactIds.has(c.id)}
                  onChange={() => toggleContact(c.id)}
                />
              }
              label={c.name}
            />
          ))}
        </FormGroup>
        <Box display="flex" alignItems="center" gap={2} mt={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel shrink>Agendar para (opcional)</InputLabel>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              inputProps={{ min: new Date().toISOString().slice(0, 16) }}
              endAdornment={
                <InputAdornment position="end">
                  <ScheduleIcon color="primary" />
                </InputAdornment>
              }
            />
          </FormControl>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSend}
            disabled={!text.trim() || selectedContactIds.size === 0 || loading}
          >
            {scheduledAt ? "Agendar" : "Enviar agora"}
          </Button>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        Mensagens
      </Typography>
      <Tabs
        value={filterTab}
        onChange={(_, v: FilterTab) => setFilterTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab label="Todas" value="all" />
        <Tab label="Enviadas" value="sent" />
        <Tab label="Agendadas" value="scheduled" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredMessages.length === 0 ? (
        <Typography color="text.secondary">
          {filterTab === "all"
            ? "Nenhuma mensagem."
            : `Nenhuma mensagem ${filterTab === "sent" ? "enviada" : "agendada"}.`}
        </Typography>
      ) : (
        <List>
          {filteredMessages.map((m) => (
            <ListItem key={m.id} divider>
              <ListItemText
                primary={m.text}
                secondary={
                  <>
                    <Chip
                      size="small"
                      label={statusLabel[m.status]}
                      sx={{ mr: 0.5 }}
                    />
                    {m.status === "scheduled"
                      ? `Agendada para ${formatDate(m.scheduledAt)}`
                      : `Criada em ${m.createdAt}`}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(m.id)}
                  aria-label="excluir"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
