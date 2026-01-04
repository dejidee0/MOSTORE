// src/components/MessageNotificationProvider.jsx
"use client";

import { useMessageNotifications } from "@/hooks/useMessageNotification";

export default function MessageNotificationProvider({ children }) {
  useMessageNotifications();
  return <>{children}</>;
}
