import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "../onboarding/contracts") {
      return nextResolve("../onboarding/contracts.ts", context);
    }
    return nextResolve(specifier, context);
  },
});

const {
  investorEligibilitySchema,
  investorPatchSchema,
} = await import("./investor-onboarding.ts");

const partialEligibility = {
  investorClassification: "",
  investmentExperience: "",
  privateCompanyExperience: "",
  sourceOfFunds: "",
  riskAcknowledged: false,
};

test("screen 4 accepts a partial eligibility draft", () => {
  const parsed = investorPatchSchema.safeParse({
    screen: 4,
    eligibility: partialEligibility,
  });

  assert.equal(parsed.success, true);
});

test("complete eligibility remains strict", () => {
  assert.equal(
    investorEligibilitySchema.safeParse(partialEligibility).success,
    false,
  );
  assert.equal(
    investorEligibilitySchema.safeParse({
      investorClassification: "Accredited investor",
      investmentExperience: "5+ years",
      privateCompanyExperience: "Yes",
      sourceOfFunds: "Employment income",
      riskAcknowledged: true,
    }).success,
    true,
  );
});
