export interface Message {
  id: string;
  clientId: string;
  connectionId: string;
  contactIds: string[];

  text: string;
  scheduledAt: number;
  status: "scheduled" | "sent" | "failed";

  createdAt: string;
}
