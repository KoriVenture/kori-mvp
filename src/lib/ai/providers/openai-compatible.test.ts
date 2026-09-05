import assert from "node:assert/strict";
import { test } from "node:test";
import { requestOpenAiCompatible, stripThinking } from "./openai-compatible";

test("stripThinking removes hidden thinking blocks", () => {
  assert.equal(stripThinking("<think>private</think>Visible answer"), "Visible answer");
});

test("openai compatible adapter normalizes final content", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ choices: [{ message: { content: "<think>hidden</think>Answer" } }] }), { status: 200 });

  try {
    const result = await requestOpenAiCompatible({
      provider: "minimax",
      baseUrl: "https://example.test/v1",
      apiKey: "secret",
      model: "test-model",
    }, "system", "question", 1000);
    assert.deepEqual(result, { provider: "minimax", model: "test-model", answer: "Answer" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
