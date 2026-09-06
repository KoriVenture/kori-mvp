export type DiligenceAiMessageValue = {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: "minimax";
};

export function DiligenceAiMessage({
  message,
  onCopy,
}: {
  message: DiligenceAiMessageValue;
  onCopy: (content: string) => void;
}) {
  const assistant = message.role === "assistant";

  return (
    <article className={`dd-ai-message ${assistant ? "dd-ai-message--assistant" : "dd-ai-message--user"}`}>
      <p className="dd-ai-message-label">
        {assistant ? "Kori AI · MiniMax" : "You"}
      </p>
      <p className="dd-ai-message-body">{message.content}</p>
      {assistant ? (
        <div className="dd-ai-message-actions">
          <button type="button" onClick={() => onCopy(message.content)}>
            Copy
          </button>
        </div>
      ) : null}
    </article>
  );
}
