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
import type { Contact } from "../types/Contact";

const COLLECTION = "contacts";

const toContact = (id: string, data: Record<string, unknown>): Contact => ({
  id,
  clientId: data.clientId as string,
  connectionId: data.connectionId as string,
  name: data.name as string,
  phone: data.phone as string,
  createdAt:
    (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ??
    (data.createdAt as string),
});

export const contactService = {
  subscribeByClientAndConnection: (
    clientId: string,
    connectionId: string,
    onUpdate: (contacts: Contact[]) => void,
  ): Unsubscribe => {
    const q = query(
      collection(db, COLLECTION),
      where("clientId", "==", clientId),
      where("connectionId", "==", connectionId),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
      const contacts = snapshot.docs.map((d) => toContact(d.id, d.data()));

      onUpdate(contacts);
    });
  },

  create: async (
    clientId: string,
    connectionId: string,
    name: string,
    phone: string,
  ): Promise<string> => {
    const ref = await addDoc(collection(db, COLLECTION), {
      clientId,
      connectionId,
      name,
      phone,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  getById: async (id: string): Promise<Contact | null> => {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return toContact(snap.id, snap.data());
  },

  update: async (
    id: string,
    data: { name: string; phone: string },
  ): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
