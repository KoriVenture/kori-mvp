"use client";

import { Button } from "@kori/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@kori/ui/components/sheet";
import { cn } from "@kori/ui/lib/utils";
import { ExternalLink, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { KoriLogo } from "@/components/brand/kori-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  dashboardRoleConfigs,
  type DashboardRoleId,
} from "@/content/dashboards/shared";
import { Link, usePathname } from "@/i18n/navigation";

type DashboardNavigationProps = {
  mobile?: boolean;
  role: DashboardRoleId;
};

function NavigationContents({
  mobile = false,
  role,
}: DashboardNavigationProps) {
  const config = dashboardRoleConfigs[role];
  const tCommon = useTranslations("dashboard-common");
  const tRole = useTranslations(config.namespace);
  const pathname = usePathname();
  const locale = useLocale();
  const basePath = `/dashboard/${role}`;

  return (
    <div className="flex h-full flex-col bg-[var(--kori-bg-primary)] text-foreground">
      <div className="flex h-[4.75rem] items-center justify-between border-b border-border px-6">
        <Link href="/" aria-label={tCommon("backHome")}>
          <KoriLogo priority />
        </Link>
        {mobile ? (
          <SheetClose
            render={
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={tCommon("menuClose")}
              />
            }
          >
            <X aria-hidden="true" />
          </SheetClose>
        ) : null}
      </div>

      <div className="border-b border-border px-6 py-5">
        <p className="font-interface text-[0.5625rem] tracking-[0.16em] text-primary uppercase">
          {tCommon("workspace")}
        </p>
        <p className="mt-1 font-display text-base">{tRole("title")}</p>
      </div>

      <nav
        aria-label={tCommon("navigationLabel")}
        className="flex-1 overflow-y-auto px-3 py-5"
      >
        <p className="px-3 pb-2 font-interface text-[0.5625rem] tracking-[0.14em] text-muted-foreground uppercase">
          {tCommon("navigation.overview")}
        </p>
        <ul className="space-y-1">
          {config.navigation.map(({ icon: Icon, labelKey, segment, view }) => {
            const href = segment ? `${basePath}/${segment}` : basePath;
            const active =
              pathname === href ||
              pathname === `/${locale}${href}` ||
              (view === "overview" &&
                (pathname === `${href}/` || pathname === `/${locale}${href}/`));

            return (
              <li key={view}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-[2px] border-l-2 px-3 font-interface text-xs tracking-[0.04em] transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  <span>{tRole(`navigation.${labelKey}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-7 px-3 pb-2 font-interface text-[0.5625rem] tracking-[0.14em] text-muted-foreground uppercase">
          {tCommon("navigation.tools")}
        </p>
        <Link
          href="/simulator"
          className="flex min-h-10 items-center gap-3 rounded-[2px] border-l-2 border-transparent px-3 font-interface text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
          <span>{tCommon("navigation.simulator")}</span>
        </Link>
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <span className="grid size-9 place-items-center rounded-full border border-primary/30 bg-primary/10 font-data text-xs text-primary">
            {config.userInitials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {config.userName}
            </span>
            <span className="block text-[0.625rem] tracking-[0.08em] text-muted-foreground uppercase">
              {tCommon("demoUser")}
            </span>
          </span>
        </div>
        <div
          className="flex items-center justify-between border-t border-border pt-3"
          aria-label={tCommon("preferences")}
        >
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}

export function DashboardDesktopNavigation({
  role,
}: Pick<DashboardNavigationProps, "role">) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border lg:block">
      <NavigationContents role={role} />
    </aside>
  );
}

export function DashboardMobileNavigation({
  role,
}: Pick<DashboardNavigationProps, "role">) {
  const t = useTranslations("dashboard-common");

  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
      <Link href="/" aria-label={t("backHome")}>
        <KoriLogo priority />
      </Link>
      <Sheet>
        <SheetTrigger
          render={
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={t("menuOpen")}
            />
          }
        >
          <Menu aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="left" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>{t("navigationLabel")}</SheetTitle>
            <SheetDescription>{t("menuDescription")}</SheetDescription>
          </SheetHeader>
          <NavigationContents mobile role={role} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
