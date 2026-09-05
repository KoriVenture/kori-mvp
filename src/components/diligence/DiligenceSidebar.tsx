"use client";

import { useRouter } from "next/navigation";

import type { DiligenceRoomDTO } from "../../lib/diligence/types";

const NAVIGATION = [
  {
    label: "Home",
    href: "/dashboard",
  },
  {
    label: "Discover",
    href: "/dashboard#discover",
  },
  {
    label: "Deals",
    href: "/dashboard#discover",
  },
  {
    label: "Diligence",
    href: "/dashboard/diligence",
  },
  {
    label: "Portfolio",
    href: "/profile?role=investor",
  },
] as const;

export function DiligenceSidebar({
  viewer,
}: {
  viewer: DiligenceRoomDTO["viewer"];
}) {
  const router = useRouter();

  return (
    <aside className="dd-rail">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/kori-logo.svg"
        alt="Kori"
      />

      <nav aria-label="Product navigation">
        {NAVIGATION.map((item) => (
          <button
            type="button"
            className={
              item.label === "Diligence"
                ? "active"
                : ""
            }
            key={item.label}
            onClick={() =>
              router.push(item.href)
            }
          >
            <span>
              {item.label.slice(0, 1)}
            </span>

            {item.label}
          </button>
        ))}
      </nav>

      <div className="dd-person">
        <i>
          {viewer.initials}
        </i>

        <span>
          <b>
            {viewer.displayName}
          </b>

          <small>
            Investor
          </small>
        </span>
      </div>
    </aside>
  );
}
