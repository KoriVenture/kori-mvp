import type { ReactNode } from "react";

import type { DashboardRoleId } from "@/content/dashboards/shared";

import {
  DashboardDesktopNavigation,
  DashboardMobileNavigation,
} from "./dashboard-navigation";

type DashboardShellProps = {
  children: ReactNode;
  role: DashboardRoleId;
};

export function DashboardShell({ children, role }: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <DashboardDesktopNavigation role={role} />
      <div className="lg:pl-60">
        <DashboardMobileNavigation role={role} />
        <main className="min-h-dvh px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
