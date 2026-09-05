import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const componentSuffix = "/src/components/diligence/DueDiligenceRoom.tsx";
const pageSuffix = "/src/app/dashboard/diligence/[roomId]/page.tsx";
const stateHarnessUrl = new URL(
  "../src/components/diligence/diligence-state-harness.ts",
  import.meta.url,
).href;
const cacheHarnessUrl = new URL(
  "../src/components/diligence/diligence-cache-harness.ts",
  import.meta.url,
).href;

function endsWithPath(url, suffix) {
  return decodeURIComponent(url).endsWith(suffix);
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/navigation") {
    return nextResolve("next/navigation.js", context);
  }

  if (specifier === "react" && context.parentURL && context.parentURL.includes("/src/components/diligence/")) {
    return { url: stateHarnessUrl, shortCircuit: true };
  }

  if (specifier === "react" && context.parentURL && endsWithPath(context.parentURL, pageSuffix)) {
    return { url: cacheHarnessUrl, shortCircuit: true };
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (specifier.startsWith(".") && context.parentURL) {
      const unresolvedUrl = new URL(specifier, context.parentURL);
      for (const extension of [".ts", ".tsx"]) {
        const candidate = new URL(`${unresolvedUrl.href}${extension}`);
        if (existsSync(candidate)) {
          return { url: candidate.href, shortCircuit: true };
        }
      }
    }

    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith(".tsx")) {
    return nextLoad(url, context);
  }

  let source = await readFile(fileURLToPath(url), "utf8");

  if (
    endsWithPath(url, componentSuffix) &&
    process.env.DILIGENCE_COMPONENT_MUTATION === "record-noop"
  ) {
    source = source.replace(
      'onRecordDecision={() => setView("Decision")}',
      "onRecordDecision={() => undefined}",
    );
  }

  if (
    endsWithPath(url, pageSuffix) &&
    process.env.DILIGENCE_PAGE_MUTATION === "uncached"
  ) {
    source = source.replace(
      "cache(loadDiligenceRoom)",
      "loadDiligenceRoom",
    );
  }

  const output = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: fileURLToPath(url),
  });

  return { format: "module", source: output.outputText, shortCircuit: true };
}
