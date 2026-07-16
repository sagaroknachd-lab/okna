import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { NotificationsSync } from "@/components/NotificationsSync";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <NotificationsSync />
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
