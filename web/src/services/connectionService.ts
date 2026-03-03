import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../api/firebase/setup";
import type { Connection } from "../types/Connection";

const COLLECTION = "connections";

const toConnection = (
  id: string,
  data: Record<string, unknown>,
): Connection => ({
  id,
  clientId: data.clientId as string,
  name: data.name as string,
  createdAt:
    (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ??
    (data.createdAt as string),
});

export const connectionService = {
  subscribeByClientId: (
    clientId: string,
    onUpdate: (connections: Connection[]) => void,
  ): Unsubscribe => {
    const q = query(
      collection(db, COLLECTION),
      where("clientId", "==", clientId),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const connections = snapshot.docs
          .map((d) => toConnection(d.id, d.data()))
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
        onUpdate(connections);
      },
      (err) => {
        console.error("[connectionService] subscribe error:", err);
        onUpdate([]);
      },
    );
  },

  create: async (clientId: string, name: string): Promise<string> => {
    const ref = await addDoc(collection(db, COLLECTION), {
      clientId,
      name,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  getById: async (id: string): Promise<Connection | null> => {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return toConnection(snap.id, snap.data());
  },

  update: async (id: string, name: string): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, id), { name });
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
