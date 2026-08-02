"use client";

import { Button } from "@kori/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@kori/ui/components/dropdown-menu";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const themeOptions = [
  { value: "system", label: "themeSystem", Icon: Monitor },
  { value: "light", label: "themeLight", Icon: Sun },
  { value: "dark", label: "themeDark", Icon: Moon },
] as const;

const subscribeToHydration = () => () => {};

export function ThemeSwitcher() {
  const t = useTranslations("navigation");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled
        aria-label={t("themeLabel")}
      >
        <Monitor aria-hidden="true" />
      </Button>
    );
  }

  const ActiveIcon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("themeLabel")}
          />
        }
      >
        <ActiveIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40 rounded-md border">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("themeLabel")}</DropdownMenuLabel>
          {themeOptions.map(({ value, label, Icon }) => {
            const active = value === theme;

            return (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className="min-h-9 font-interface"
              >
                <Icon aria-hidden="true" />
                <span>{t(label)}</span>
                {active ? (
                  <>
                    <span className="sr-only">— {t("activeLabel")}</span>
                    <Check aria-hidden="true" className="ml-auto" />
                  </>
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
