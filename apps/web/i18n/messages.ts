import type { SupportedLocale } from "@kori/i18n";

export const messageNamespaces = [
  "common",
  "navigation",
  "status",
  "validation",
  "landing",
  "stories",
  "capital-map",
  "dashboard-common",
  "fund-manager",
  "angel-investor",
  "startup-founder",
  "simulator",
] as const;

async function loadEnglish() {
  const [
    common,
    navigation,
    status,
    validation,
    landing,
    stories,
    capitalMap,
    dashboardCommon,
    fundManager,
    angelInvestor,
    startupFounder,
    simulator,
  ] = await Promise.all([
    import("../messages/en/common.json"),
    import("../messages/en/navigation.json"),
    import("../messages/en/status.json"),
    import("../messages/en/validation.json"),
    import("../messages/en/landing.json"),
    import("../messages/en/stories.json"),
    import("../messages/en/capital-map.json"),
    import("../messages/en/dashboard-common.json"),
    import("../messages/en/fund-manager.json"),
    import("../messages/en/angel-investor.json"),
    import("../messages/en/startup-founder.json"),
    import("../messages/en/simulator.json"),
  ]);

  return {
    common: common.default,
    navigation: navigation.default,
    status: status.default,
    validation: validation.default,
    landing: landing.default,
    stories: stories.default,
    "capital-map": capitalMap.default,
    "dashboard-common": dashboardCommon.default,
    "fund-manager": fundManager.default,
    "angel-investor": angelInvestor.default,
    "startup-founder": startupFounder.default,
    simulator: simulator.default,
  };
}

const loaders = {
  en: loadEnglish,
  fr: async () => {
    const [
      common,
      navigation,
      status,
      validation,
      landing,
      stories,
      capitalMap,
      dashboardCommon,
      fundManager,
      angelInvestor,
      startupFounder,
      simulator,
    ] = await Promise.all([
      import("../messages/fr/common.json"),
      import("../messages/fr/navigation.json"),
      import("../messages/fr/status.json"),
      import("../messages/fr/validation.json"),
      import("../messages/fr/landing.json"),
      import("../messages/fr/stories.json"),
      import("../messages/fr/capital-map.json"),
      import("../messages/fr/dashboard-common.json"),
      import("../messages/fr/fund-manager.json"),
      import("../messages/fr/angel-investor.json"),
      import("../messages/fr/startup-founder.json"),
      import("../messages/fr/simulator.json"),
    ]);

    return {
      common: common.default,
      navigation: navigation.default,
      status: status.default,
      validation: validation.default,
      landing: landing.default,
      stories: stories.default,
      "capital-map": capitalMap.default,
      "dashboard-common": dashboardCommon.default,
      "fund-manager": fundManager.default,
      "angel-investor": angelInvestor.default,
      "startup-founder": startupFounder.default,
      simulator: simulator.default,
    };
  },
  es: async () => {
    const [
      common,
      navigation,
      status,
      validation,
      landing,
      stories,
      capitalMap,
      dashboardCommon,
      fundManager,
      angelInvestor,
      startupFounder,
      simulator,
    ] = await Promise.all([
      import("../messages/es/common.json"),
      import("../messages/es/navigation.json"),
      import("../messages/es/status.json"),
      import("../messages/es/validation.json"),
      import("../messages/es/landing.json"),
      import("../messages/es/stories.json"),
      import("../messages/es/capital-map.json"),
      import("../messages/es/dashboard-common.json"),
      import("../messages/es/fund-manager.json"),
      import("../messages/es/angel-investor.json"),
      import("../messages/es/startup-founder.json"),
      import("../messages/es/simulator.json"),
    ]);

    return {
      common: common.default,
      navigation: navigation.default,
      status: status.default,
      validation: validation.default,
      landing: landing.default,
      stories: stories.default,
      "capital-map": capitalMap.default,
      "dashboard-common": dashboardCommon.default,
      "fund-manager": fundManager.default,
      "angel-investor": angelInvestor.default,
      "startup-founder": startupFounder.default,
      simulator: simulator.default,
    };
  },
} satisfies Record<SupportedLocale, () => Promise<unknown>>;

export type AppMessages = Awaited<ReturnType<typeof loadEnglish>>;

export function loadMessages(locale: SupportedLocale): Promise<AppMessages> {
  return loaders[locale]() as Promise<AppMessages>;
}
