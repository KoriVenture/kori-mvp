"use client";

import { Button } from "@kori/ui/components/button";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";

import { KoriLogo } from "@/components/brand/kori-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Link } from "@/i18n/navigation";

const navigationItems = [
  { key: "how", href: "/#how" },
  { key: "thesis", href: "/#thesis" },
  { key: "opportunity", href: "/#opportunity" },
  { key: "waitlist", href: "/#waitlist" },
  { key: "stories", href: "/stories" },
  { key: "capitalMap", href: "/capital-map" },
] as const;

export function MarketingHeader() {
  const t = useTranslations("landing.navigation");
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      setHidden(currentY > lastY && currentY > 100);
      lastY = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-100 transition-[opacity,transform] duration-400 ease-out ${
        hidden ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <nav
        aria-label={t("label")}
        className="flex min-h-20 items-center justify-between gap-4 bg-[linear-gradient(to_bottom,var(--kori-nav-bg)_60%,transparent)] px-6 py-5 backdrop-blur-[8px] md:px-8 xl:px-[3.75rem]"
      >
        <Link
          href="/#hero"
          aria-label={t("home")}
          onClick={() => setOpen(false)}
        >
          <KoriLogo priority />
        </Link>

        <ul className="hidden items-center gap-7 lg:flex xl:gap-10">
          {navigationItems.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="font-interface text-[0.6875rem] font-light tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-primary"
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
          <ThemeSwitcher />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls="marketing-mobile-navigation"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </nav>

      {open ? (
        <div
          id="marketing-mobile-navigation"
          className="border-y border-border bg-[var(--kori-nav-bg)] px-6 py-6 backdrop-blur-[8px] lg:hidden"
        >
          <ul className="grid gap-1">
            {navigationItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-l-2 border-transparent px-4 py-3 font-interface text-xs tracking-[0.16em] text-foreground uppercase hover:border-primary hover:bg-primary/8 hover:text-primary"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
