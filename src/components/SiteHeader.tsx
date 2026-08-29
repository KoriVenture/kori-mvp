type ActivePage =
  | "how-kori-works"
  | "investors"
  | "communities"
  | "founders"
  | "about";

const links: { href: string; label: string; key: ActivePage }[] = [
  { href: "/how-kori-works", label: "How Kori Works", key: "how-kori-works" },
  { href: "/investors", label: "Investors", key: "investors" },
  { href: "/communities", label: "Communities", key: "communities" },
  { href: "/founders", label: "Founders", key: "founders" },
  { href: "/about", label: "About us", key: "about" },
];

export function SiteHeader({ active }: { active?: ActivePage }) {
  return (
    <nav className="topbar" aria-label="Primary">
      <a className="brand" href="/" aria-label="Kori home">
        <img
          className="light-logo"
          src="/assets/kori_logo_horizontal.svg"
          alt="Kori"
        />
        <img
          className="dark-logo"
          src="/assets/kori_logo_horizontal_reverse.svg"
          alt=""
          aria-hidden="true"
        />
      </a>

      <ul className="navlinks">
        {links.map((link) => (
          <li key={link.key}>
            <a
              className={active === link.key ? "active" : undefined}
              aria-current={active === link.key ? "page" : undefined}
              href={link.href}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <a className="btn" href="/join">
        Join the network
      </a>
    </nav>
  );
}
