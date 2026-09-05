import type { DiligenceRoomDTO } from "../../diligence/types";
import { buildDiligenceAiContext } from "./context";
import { buildDiligenceAiSystemPrompt } from "./prompt";
import { askMiniMax } from "../providers/minimax";
import type { AiProviderResult } from "../types";

function inputs(room: DiligenceRoomDTO, message: string) {
  const context = buildDiligenceAiContext(room);
  return {
    systemPrompt: buildDiligenceAiSystemPrompt(context),
    message,
  };
}

export function analyzeWithMiniMax(room: DiligenceRoomDTO, message: string): Promise<AiProviderResult> {
  const input = inputs(room, message);
  return askMiniMax(input.systemPrompt, input.message);
}
