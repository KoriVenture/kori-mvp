"use client";

import {
  localeMetadata,
  supportedLocales,
  type SupportedLocale,
} from "@kori/i18n";
import { Button } from "@kori/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@kori/ui/components/dropdown-menu";
import { Check, Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

import { withSearchParams } from "./locale-path";

function LanguageSwitcherContent() {
  const t = useTranslations("navigation");
  const locale = useLocale() as SupportedLocale;
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams().toString();

  function changeLocale(nextLocale: SupportedLocale) {
    if (nextLocale === locale) return;

    router.replace(withSearchParams(pathname, search), {
      locale: nextLocale,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t("languageLabel")}
          />
        }
      >
        <Globe2 aria-hidden="true" />
        <span>{localeMetadata[locale].displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rounded-md border">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("languageLabel")}</DropdownMenuLabel>
          {supportedLocales.map((nextLocale) => {
            const active = nextLocale === locale;

            return (
              <DropdownMenuItem
                key={nextLocale}
                onClick={() => changeLocale(nextLocale)}
                className="min-h-9 font-interface"
              >
                <span>{localeMetadata[nextLocale].displayName}</span>
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

export function LanguageSwitcher() {
  const t = useTranslations("navigation");

  return (
    <Suspense
      fallback={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled
          aria-label={t("languageLabel")}
        >
          <Globe2 aria-hidden="true" />
        </Button>
      }
    >
      <LanguageSwitcherContent />
    </Suspense>
  );
}
