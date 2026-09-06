"use client";

import type { FounderDiligenceRoomDTO } from "@/lib/diligence/founder/types";

export function FounderDiligenceSidebar({ room }: { room: FounderDiligenceRoomDTO }) {
  const primary = ["Overview", "Company profile", "Fundraise", "Data room", "Diligence", "Investors", "Vehicles & agreements", "Milestones", "Capital", "Updates"];
  const secondary = ["Governance", "Documents", "Activity log", "Notifications", "Help"];
  return (
    <aside className="dd-founder-sidebar">
      <div className="dd-founder-brand"><b>Kori</b><span>FOUNDER WORKSPACE</span></div>
      <div className="dd-founder-company"><strong>{room.startup.displayName}</strong><small>Founder Administrator</small></div>
      <nav aria-label="Founder workspace navigation">
        {primary.map((item) => <a className={item === "Diligence" ? "active" : ""} href={item === "Diligence" ? `/dashboard/diligence/${room.room.id}?view=founder` : "#"} key={item}>{item}</a>)}
        <hr />
        {secondary.map((item) => <a href="#" key={item}>{item}</a>)}
      </nav>
      <div className="dd-founder-user"><span>{room.viewer.initials}</span><div><b>{room.viewer.displayName || "Founder"}</b><small>{room.startup.displayName}</small></div></div>
    </aside>
  );
}
