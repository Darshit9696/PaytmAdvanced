export type NotificationType = "TRANSFER_SENT" | "TRANSFER_RECEIVED" | "PAYMENT_FAILED";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}
