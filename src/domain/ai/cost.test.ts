import { describe, expect, it } from "vitest";
import { estimateCostUsd } from "./cost";

describe("estimateCostUsd", () => {
  it("calcule le coût à partir des tarifs par million de jetons", () => {
    expect(estimateCostUsd({ inputTokens: 1_000_000, outputTokens: 500_000 }, { inputUsdPerMillion: 0.3, outputUsdPerMillion: 2.5 }))
      .toEqual({ usd: 1.55, estimated: true });
  });

  it("n'invente pas de coût sans tarif", () => {
    expect(estimateCostUsd({ inputTokens: 10, outputTokens: 10 }, null)).toEqual({ usd: 0, estimated: false });
  });
});
