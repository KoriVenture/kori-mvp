export function FounderDiligenceAiMessage({ role, content, onCopy }: { role: "user" | "assistant"; content: string; onCopy: (content: string) => void }) {
  return <article className={`dd-founder-ai-message ${role}`}><small>{role === "assistant" ? "Kori AI · MiniMax" : "You"}</small><p>{content}</p>{role === "assistant" ? <button type="button" onClick={() => onCopy(content)}>Copy</button> : null}</article>;
}
