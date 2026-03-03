import { create } from "zustand";
import { contactService } from "../services/contactService";
import type { Contact } from "../types/Contact";

type ContactState = {
  contacts: Contact[];
  loading: boolean;
  unsubscribe: (() => void) | null;

  setContacts: (contacts: Contact[]) => void;
  subscribe: (clientId: string, connectionId: string) => void;
  stopSubscribe: () => void;

  createContact: (
    clientId: string,
    connectionId: string,
    name: string,
    phone: string
  ) => Promise<string>;
  updateContact: (id: string, data: { name: string; phone: string }) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
};

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  loading: false,
  unsubscribe: null,

  setContacts: (contacts) => set({ contacts }),

  subscribe: (clientId, connectionId) => {
    get().stopSubscribe();
    if (!connectionId) {
      set({ contacts: [] });
      return;
    }
    const unsub = contactService.subscribeByClientAndConnection(
      clientId,
      connectionId,
      (contacts) => set({ contacts })
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

  createContact: async (clientId, connectionId, name, phone) => {
    set({ loading: true });
    try {
      return await contactService.create(clientId, connectionId, name, phone);
    } finally {
      set({ loading: false });
    }
  },

  updateContact: async (id, data) => {
    set({ loading: true });
    try {
      await contactService.update(id, data);
    } finally {
      set({ loading: false });
    }
  },

  deleteContact: async (id) => {
    set({ loading: true });
    try {
      await contactService.delete(id);
    } finally {
      set({ loading: false });
    }
  },
}));
