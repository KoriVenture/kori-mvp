export type AiProviderName = "minimax";

export type AiProviderResult = {
  provider: AiProviderName;
  model: string;
  answer: string;
};

export type DiligenceAiRequest = {
  message: string;
};

export class AiConfigurationError extends Error {
  constructor(message = "AI provider is not configured.") {
    super(message);
    this.name = "AiConfigurationError";
  }
}

export class AiProviderError extends Error {
  constructor(message = "AI provider request failed.") {
    super(message);
    this.name = "AiProviderError";
  }
}

export class AiTimeoutError extends Error {
  constructor(message = "AI provider request timed out.") {
    super(message);
    this.name = "AiTimeoutError";
  }
}
