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
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../api/firebase/setup";
import type { Message } from "../types/Message";

const COLLECTION = "messages";

type MessageStatus = "scheduled" | "sent" | "failed";

const toMessage = (id: string, data: Record<string, unknown>): Message => ({
  id,
  clientId: data.clientId as string,
  connectionId: data.connectionId as string,
  contactIds: (data.contactIds as string[]) ?? [],
  text: data.text as string,
  scheduledAt:
    typeof data.scheduledAt === "number"
      ? data.scheduledAt
      : ((data.scheduledAt as { toMillis?: () => number })?.toMillis?.() ?? 0),
  status: (data.status as MessageStatus) ?? "scheduled",
  createdAt:
    (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ??
    (data.createdAt as string),
});

export const messageService = {
  subscribeByClientAndConnection: (
    clientId: string,
    connectionId: string,
    onUpdate: (messages: Message[]) => void,
  ): Unsubscribe => {
    const q = query(
      collection(db, COLLECTION),
      where("clientId", "==", clientId),
      where("connectionId", "==", connectionId),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((d) => toMessage(d.id, d.data()));
      onUpdate(messages);
    });
  },

  create: async (
    clientId: string,
    connectionId: string,
    contactIds: string[],
    text: string,
    scheduledAt: number | null,
  ): Promise<string> => {
    const now = Date.now();
    const status: MessageStatus =
      scheduledAt == null || scheduledAt <= now ? "sent" : "scheduled";
    const ref = await addDoc(collection(db, COLLECTION), {
      clientId,
      connectionId,
      contactIds,
      text,
      scheduledAt: scheduledAt ?? now,
      status,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  getById: async (id: string): Promise<Message | null> => {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return toMessage(snap.id, snap.data());
  },

  update: async (
    id: string,
    data: Partial<Pick<Message, "text" | "scheduledAt" | "status">>,
  ): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, id), data as Record<string, unknown>);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
