import { z } from "zod";

import type { PublicSignupRole } from "./contracts";

type RpcError = {
  message: string;
};

type BootstrapRpcClient = {
  rpc(
    name: "bootstrap_kori_identity",
    args: {
      p_role: PublicSignupRole;
    },
  ): PromiseLike<{
    data: unknown;
    error: RpcError | null;
  }>;
};

export type BootstrapResult =
  | {
      ok: true;
      profileId: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function bootstrapOnboardingIdentity(
  client: BootstrapRpcClient,
  role: PublicSignupRole,
): Promise<BootstrapResult> {
  const result = await client.rpc("bootstrap_kori_identity", {
    p_role: role,
  });

  if (result.error) {
    return {
      ok: false,
      error: result.error.message,
    };
  }

  const profileId = z.uuid().safeParse(result.data);

  if (!profileId.success) {
    return {
      ok: false,
      error: "Kori identity bootstrap did not return a profile id.",
    };
  }

  return {
    ok: true,
    profileId: profileId.data,
  };
}
