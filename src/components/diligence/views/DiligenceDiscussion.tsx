import { useState } from "react";
import type { DiligenceRoomDTO } from "../../../lib/diligence/types";

export function DiligenceDiscussion({ messages }: { messages: DiligenceRoomDTO["discussion"] }) {
  const [text, setText] = useState("");
  return (
    <div className="dd-content">
      <section className="dd-page-title">
        <div>
          <p className="dd-kicker">Reviewer discussion</p>
          <h2>Make the reasoning visible.</h2>
        </div>
      </section>
      <div className="dd-discussion">
        <div className="dd-thread">
          {messages.map((x) => (
            <article key={x.id}>
              <i>{x.authorInitials}</i>
              <div>
                <h4>
                  {x.authorName} <span>{x.authorRoleLabel}</span>
                </h4>
                <p>{x.body}</p>
                <button>Reply</button>
              </div>
            </article>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (!text.trim()) {
              return;
            }

            setText("");
          }}
        >
          <label>
            Add to the record
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share evidence, a question, or a reasoned assessment"
            />
          </label>
          <button className="primary" disabled={!text.trim()}>
            Post note
          </button>
        </form>
      </div>
    </div>
  );
}
