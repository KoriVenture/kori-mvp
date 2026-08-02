import { KoriLogo } from "@/components/brand/kori-logo";
import { Link } from "@/i18n/navigation";

type MarketingFooterProps = {
  copyright: string;
  homeLabel: string;
  tagline: string;
};

export function MarketingFooter({
  copyright,
  homeLabel,
  tagline,
}: MarketingFooterProps) {
  return (
    <footer className="grid items-center gap-6 border-t border-border px-6 py-12 text-center md:grid-cols-3 md:px-8 md:text-left xl:px-[3.75rem]">
      <Link
        href="/"
        aria-label={homeLabel}
        className="justify-self-center md:justify-self-start"
      >
        <KoriLogo />
      </Link>
      <p className="font-editorial text-lg font-light italic text-muted-foreground md:text-center">
        {tagline}
      </p>
      <p className="text-xs text-muted-foreground md:text-right">{copyright}</p>
    </footer>
  );
}
