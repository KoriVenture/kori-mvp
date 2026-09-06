"use client";

export function FounderDiligenceTopbar({ round, onOpenAi, search, onSearch }: { round: string | null; onOpenAi: () => void; search: string; onSearch: (value: string) => void }) {
  return <header className="dd-founder-topbar"><div><p className="eyebrow">PRIVATE COMPANY VIEW</p><h1>Collective Diligence &amp; Term Sheet</h1><p>Provide structured responses, track legal progression, and close your {round || "raise"}.</p></div><div className="dd-founder-topbar-actions"><label><span className="sr-only">Search workspace</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search workspace..." /></label><button type="button" onClick={onOpenAi}>Open Kori AI</button></div></header>;
}
