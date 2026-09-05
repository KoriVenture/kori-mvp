import { analyzeWithMiniMax } from "@/lib/ai/diligence/orchestrator";
import {
  AiConfigurationError,
  AiProviderError,
  AiTimeoutError,
} from "@/lib/ai/types";
import { DiligenceRoomLoadError, loadDiligenceRoom } from "@/lib/diligence/queries";
import { roomIdSchema } from "@/lib/validation/diligence";
import { diligenceAiRequestSchema } from "@/lib/validation/diligence-ai";
import { resolveDiligenceRoomAccess } from "@/lib/diligence/access";
import { loadFounderDiligenceRoom } from "@/lib/diligence/founder/queries";
import { analyzeFounderDiligenceWithMiniMax } from "@/lib/ai/diligence/founder/orchestrator";

type RouteContext = {
  params: Promise<{ roomId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const parsedRoomId = roomIdSchema.safeParse((await params).roomId);
  const body = await request.json().catch(() => null);
  const parsedRequest = diligenceAiRequestSchema.safeParse(body);

  if (!parsedRoomId.success || !parsedRequest.success) {
    return Response.json({ error: "Invalid AI request." }, { status: 400 });
  }

  try {
    const audience = parsedRequest.data.audience ?? "investor";
    const access = await resolveDiligenceRoomAccess(parsedRoomId.data, audience);
    if (audience === "founder" && !access.canViewAsFounder) {
      return Response.json({ error: "Diligence room access denied." }, { status: 403 });
    }
    if (audience === "investor" && !access.canViewAsInvestor) {
      return Response.json({ error: "Diligence room access denied." }, { status: 403 });
    }
    const result = audience === "founder"
      ? await analyzeFounderDiligenceWithMiniMax(
          await loadFounderDiligenceRoom(parsedRoomId.data),
          {
            message: parsedRequest.data.message,
            mode: parsedRequest.data.mode ?? "general",
            requestId: parsedRequest.data.requestId,
            termKey: parsedRequest.data.termKey,
          },
        )
      : await analyzeWithMiniMax(await loadDiligenceRoom(parsedRoomId.data), parsedRequest.data.message);
    return Response.json(result);
  } catch (error) {
    if (error instanceof DiligenceRoomLoadError) return error.response;
    if (error instanceof AiConfigurationError) {
      return Response.json({ error: "Kori AI is not configured." }, { status: 500 });
    }
    if (error instanceof AiTimeoutError) {
      return Response.json({ error: "Kori AI timed out. Please try again." }, { status: 504 });
    }
    if (error instanceof AiProviderError) {
      return Response.json({ error: "Kori AI is temporarily unavailable." }, { status: 502 });
    }
    return Response.json({ error: "Kori AI is temporarily unavailable." }, { status: 502 });
  }
}
