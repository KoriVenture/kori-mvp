import "server-only";

import { AiConfigurationError } from "./types";

export type AiProviderConfig = {
  provider: "minimax";
  baseUrl: string;
  apiKey: string;
  model: string;
};

function required(value: string | undefined, message: string) {
  if (!value?.trim()) throw new AiConfigurationError(message);
  return value.trim();
}

export function getMiniMaxConfig(): AiProviderConfig {
  return {
    provider: "minimax",
    baseUrl: process.env.MINIMAX_BASE_URL?.trim() || "https://api.minimax.io/v1",
    apiKey: required(process.env.MINIMAX_API_KEY, "MiniMax is not configured."),
    model: process.env.MINIMAX_MODEL?.trim() || "MiniMax-M3",
  };
}
