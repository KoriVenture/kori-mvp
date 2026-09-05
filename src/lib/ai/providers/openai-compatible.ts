import type { AiProviderConfig } from "../config";
import {
  AiProviderError,
  AiTimeoutError,
  type AiProviderResult,
} from "../types";

const DEFAULT_TIMEOUT_MS = 45_000;

type ChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string }>;
    };
  }>;
};

export function stripThinking(value: string) {
  return value.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function contentFrom(response: ChatResponse) {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => part.text ?? "").join("");
  return "";
}

export async function requestOpenAiCompatible(
  config: AiProviderConfig,
  systemPrompt: string,
  message: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<AiProviderResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new AiProviderError();

    const payload = (await response.json()) as ChatResponse;
    const answer = stripThinking(contentFrom(payload));
    if (!answer) throw new AiProviderError();

    return {
      provider: config.provider,
      model: config.model,
      answer,
    };
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiTimeoutError();
    }
    throw new AiProviderError();
  } finally {
    clearTimeout(timeout);
  }
}
