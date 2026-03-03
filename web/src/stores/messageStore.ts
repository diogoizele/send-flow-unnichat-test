import { create } from "zustand";
import { messageService } from "../services/messageService";
import type { Message } from "../types/Message";

type MessageState = {
  messages: Message[];
  loading: boolean;
  unsubscribe: (() => void) | null;

  setMessages: (messages: Message[]) => void;
  subscribe: (clientId: string, connectionId: string) => void;
  stopSubscribe: () => void;

  createMessage: (
    clientId: string,
    connectionId: string,
    contactIds: string[],
    text: string,
    scheduledAt: number | null
  ) => Promise<string>;
  updateMessage: (
    id: string,
    data: Partial<Pick<Message, "text" | "scheduledAt" | "status">>
  ) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
};

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,
  unsubscribe: null,

  setMessages: (messages) => set({ messages }),

  subscribe: (clientId, connectionId) => {
    get().stopSubscribe();
    if (!connectionId) {
      set({ messages: [] });
      return;
    }
    const unsub = messageService.subscribeByClientAndConnection(
      clientId,
      connectionId,
      (messages) => set({ messages })
    );
    set({ unsubscribe: unsub });
  },

  stopSubscribe: () => {
    const unsub = get().unsubscribe;
    if (unsub) {
      unsub();
      set({ unsubscribe: null });
    }
  },

  createMessage: async (clientId, connectionId, contactIds, text, scheduledAt) => {
    set({ loading: true });
    try {
      return await messageService.create(clientId, connectionId, contactIds, text, scheduledAt);
    } finally {
      set({ loading: false });
    }
  },

  updateMessage: async (id, data) => {
    set({ loading: true });
    try {
      await messageService.update(id, data);
    } finally {
      set({ loading: false });
    }
  },

  deleteMessage: async (id) => {
    set({ loading: true });
    try {
      await messageService.delete(id);
    } finally {
      set({ loading: false });
    }
  },
}));
