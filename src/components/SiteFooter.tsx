type ActivePage =
  | "how-kori-works"
  | "investors"
  | "communities"
  | "founders"
  | "about"
  | "privacy"
  | "terms";

const links: { href: string; label: string; key: ActivePage }[] = [
  { href: "/how-kori-works", label: "How Kori Works", key: "how-kori-works" },
  { href: "/investors", label: "Investors", key: "investors" },
  { href: "/communities", label: "Communities", key: "communities" },
  { href: "/founders", label: "Founders", key: "founders" },
  { href: "/about", label: "About us", key: "about" },
  { href: "/privacy", label: "Privacy", key: "privacy" },
  { href: "/terms", label: "Terms", key: "terms" },
];

export function SiteFooter({ active }: { active?: ActivePage }) {
  return (
    <footer className="sitefoot">
      <div className="foot-wrap">
        <a href="/" aria-label="Kori home">
          <img
            className="foot-logo"
            src="/assets/kori_logo_horizontal_reverse.svg"
            alt="Kori"
          />
        </a>

        <div className="foot-links">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href}
              aria-current={active === link.key ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="foot-legal">
        © 2026 Kori Venture · Collective intelligence moves capital
      </div>
    </footer>
  );
}
