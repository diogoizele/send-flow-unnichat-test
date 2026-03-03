import { create } from "zustand";
import { connectionService } from "../services/connectionService";
import type { Connection } from "../types/Connection";

type ConnectionState = {
  connections: Connection[];
  selectedConnectionId: string | null;
  loading: boolean;
  unsubscribe: (() => void) | null;

  setConnections: (connections: Connection[]) => void;
  setSelectedConnectionId: (id: string | null) => void;
  subscribe: (clientId: string) => void;
  stopSubscribe: () => void;

  createConnection: (clientId: string, name: string) => Promise<string>;
  updateConnection: (id: string, name: string) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
};

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  selectedConnectionId: null,
  loading: false,
  unsubscribe: null,

  setConnections: (connections) => set({ connections }),
  setSelectedConnectionId: (id) => set({ selectedConnectionId: id }),

  subscribe: (clientId) => {
    get().stopSubscribe();
    const unsub = connectionService.subscribeByClientId(
      clientId,
      (connections) => set({ connections }),
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

  createConnection: async (clientId, name) => {
    set({ loading: true });
    try {
      return await connectionService.create(clientId, name);
    } finally {
      set({ loading: false });
    }
  },

  updateConnection: async (id, name) => {
    set({ loading: true });
    try {
      await connectionService.update(id, name);
    } finally {
      set({ loading: false });
    }
  },

  deleteConnection: async (id) => {
    set({ loading: true });
    try {
      await connectionService.delete(id);
      if (get().selectedConnectionId === id) {
        set({ selectedConnectionId: null });
      }
    } finally {
      set({ loading: false });
    }
  },
}));
