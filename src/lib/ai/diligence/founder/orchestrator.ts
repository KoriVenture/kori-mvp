import { askMiniMax } from "../../providers/minimax";
import type { AiProviderResult } from "../../types";
import type { FounderDiligenceRoomDTO } from "../../../diligence/founder/types";
import type { FounderAiMode } from "../../../validation/diligence-ai";
import { buildFounderDiligenceAiContext } from "./context";
import { buildFounderDiligenceAiSystemPrompt } from "./prompt";

export function analyzeFounderDiligenceWithMiniMax(
  room: FounderDiligenceRoomDTO,
  request: { message: string; mode: FounderAiMode; requestId?: string; termKey?: string },
): Promise<AiProviderResult> {
  const context = buildFounderDiligenceAiContext(room);
  const instruction = `MODE: ${request.mode}\nREQUEST_ID: ${request.requestId ?? "none"}\nTERM_KEY: ${request.termKey ?? "none"}\n\n${request.message}`;
  return askMiniMax(buildFounderDiligenceAiSystemPrompt(context), instruction);
}