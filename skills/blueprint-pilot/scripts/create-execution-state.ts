import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Options = {
  projectRoot: string;
  planId: string;
  planSource: string;
  planVersion: string;
  adapter: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(scriptDir, "..");

function parseArgs(argv: string[]): Options {
  const options: Options = {
    projectRoot: process.cwd(),
    planId: "unassigned-plan-id",
    planSource: "unassigned-plan-source",
    planVersion: "unassigned-plan-version",
    adapter: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === "--project-root") options.projectRoot = next;
    else if (arg === "--plan-id") options.planId = next;
    else if (arg === "--plan-source") options.planSource = next;
    else if (arg === "--plan-version") options.planVersion = next;
    else if (arg === "--adapter") options.adapter = next;
    else throw new Error(`Unknown argument: ${arg}`);
    index += 1;
  }

  return {
    ...options,
    projectRoot: resolve(options.projectRoot),
  };
}

function readTemplate(name: string): string {
  return readFileSync(join(skillRoot, "templates", name), "utf8");
}

function writeIfMissing(filePath: string, content: string): "created" | "skipped" {
  if (existsSync(filePath)) return "skipped";
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
  return "created";
}

function hasExistingBlueprintRegistry(executionRoot: string): boolean {
  if (!existsSync(executionRoot)) {
    return false;
  }

  return readdirSync(executionRoot, { withFileTypes: true }).some(
    (item) => item.isFile() && item.name.includes("blueprint-registry"),
  );
}

function createManifest(options: Options): string {
  const template = readTemplate("execution-manifest.md");
  const adapterLine = options.adapter ? options.adapter : "unassigned-project-adapter";

  return template
    .replace("plan_id:", `plan_id: ${options.planId}`)
    .replace("plan_source:", `plan_source: ${options.planSource}`)
    .replace("plan_version:", `plan_version: ${options.planVersion}`)
    .replace("project_root:", `project_root: ${options.projectRoot}`)
    .replace("project_adapter:", `project_adapter: ${adapterLine}`)
    .replace("overall_status:", "overall_status: not_started")
    .replace("current_phase:", "current_phase: not_started")
    .replace("current_batch:", "current_batch: define-first-batch")
    .replace("date:", `date: ${new Date().toISOString().slice(0, 10)}`)
    .replace("updated_by:", "updated_by: BlueprintPilot");
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const executionRoot = join(options.projectRoot, "docs", "architecture", "execution");

  const directories = [
    executionRoot,
    join(executionRoot, "acceptance-reports"),
    join(executionRoot, "closeouts"),
    join(executionRoot, "retrospectives"),
    join(executionRoot, "learning-candidates"),
    join(executionRoot, "local-learning"),
    join(executionRoot, "local-learning", "lessons"),
    join(executionRoot, "registry-scan-reports"),
    join(executionRoot, "workspace-change-boundaries"),
  ];

  for (const directory of directories) {
    mkdirSync(directory, { recursive: true });
  }

  const results = [
    ["current-manifest.md", writeIfMissing(join(executionRoot, "current-manifest.md"), createManifest(options))],
    ["blueprint-registry.md", hasExistingBlueprintRegistry(executionRoot)
      ? "skipped"
      : writeIfMissing(join(executionRoot, "blueprint-registry.md"), readTemplate("blueprint-registry.md")
        .replace("date:", `date: ${new Date().toISOString().slice(0, 10)}`)
        .replace("project_root:", `project_root: ${options.projectRoot}`))],
    ["deviation-log.md", writeIfMissing(join(executionRoot, "deviation-log.md"), readTemplate("deviation-log.md"))],
    ["closeouts/.gitkeep", writeIfMissing(join(executionRoot, "closeouts", ".gitkeep"), "")],
    ["retrospectives/.gitkeep", writeIfMissing(join(executionRoot, "retrospectives", ".gitkeep"), "")],
    ["learning-candidates/.gitkeep", writeIfMissing(join(executionRoot, "learning-candidates", ".gitkeep"), "")],
    ["local-learning/lessons/.gitkeep", writeIfMissing(join(executionRoot, "local-learning", "lessons", ".gitkeep"), "")],
    ["local-learning/lessons-index.md", writeIfMissing(join(executionRoot, "local-learning", "lessons-index.md"), readTemplate("local-learning-index.md")
      .replace("updated_at:", `updated_at: ${new Date().toISOString().slice(0, 10)}`))],
    ["local-learning/skips.md", writeIfMissing(join(executionRoot, "local-learning", "skips.md"), readTemplate("local-learning-skip-log.md"))],
    ["registry-scan-reports/.gitkeep", writeIfMissing(join(executionRoot, "registry-scan-reports", ".gitkeep"), "")],
    ["workspace-change-boundaries/.gitkeep", writeIfMissing(join(executionRoot, "workspace-change-boundaries", ".gitkeep"), "")],
  ];

  console.log(`BlueprintPilot execution state: ${executionRoot}`);
  for (const [file, status] of results) {
    console.log(`${status}: ${file}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
