import { getMiniMaxConfig } from "../config";
import type { AiProviderResult } from "../types";
import { requestOpenAiCompatible } from "./openai-compatible";

export function askMiniMax(systemPrompt: string, message: string): Promise<AiProviderResult> {
  return requestOpenAiCompatible(getMiniMaxConfig(), systemPrompt, message);
}
