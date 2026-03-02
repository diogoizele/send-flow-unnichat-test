import type { Timestamp } from "firebase/firestore";

export type UserProfile = {
  name: string;
  companyId?: string;
  createdAt: Timestamp;

  role?: "admin" | "user";
};
