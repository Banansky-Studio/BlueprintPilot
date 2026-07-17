import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

type Options = {
  projectRoot: string;
  manifestPath: string;
};

const requiredFields = [
  "plan_id:",
  "plan_source:",
  "plan_version:",
  "project_root:",
  "project_adapter:",
  "overall_status:",
  "current_phase:",
  "current_batch:",
];

const requiredHeadings = [
  "## Objective",
  "## Execution Contract",
  "## Batches",
  "## Frozen Decisions",
  "## Verification Gates",
  "## Evidence Paths",
  "## Next Action",
  "## Last Updated",
];

const requiredDirectories = [
  ["acceptance-reports"],
  ["closeouts"],
  ["retrospectives"],
  ["learning-candidates"],
  ["registry-scan-reports"],
  ["workspace-change-boundaries"],
];

function parseArgs(argv: string[]): Options {
  const options: Options = {
    projectRoot: process.cwd(),
    manifestPath: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === "--project-root") options.projectRoot = next;
    else if (arg === "--manifest") options.manifestPath = next;
    else throw new Error(`Unknown argument: ${arg}`);
    index += 1;
  }

  const projectRoot = resolve(options.projectRoot);
  const manifestPath = options.manifestPath
    ? resolve(options.manifestPath)
    : join(projectRoot, "docs", "architecture", "execution", "current-manifest.md");

  return { projectRoot, manifestPath };
}

function hasNonEmptyField(content: string, field: string): boolean {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escaped}\\s*\\S+`, "m");
  return pattern.test(content);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const errors: string[] = [];

  if (!existsSync(options.manifestPath)) {
    errors.push(`Missing manifest: ${options.manifestPath}`);
  }

  const content = existsSync(options.manifestPath)
    ? readFileSync(options.manifestPath, "utf8")
    : "";

  for (const field of requiredFields) {
    if (!hasNonEmptyField(content, field)) {
      errors.push(`Missing or empty field: ${field}`);
    }
  }

  for (const heading of requiredHeadings) {
    if (!content.includes(heading)) {
      errors.push(`Missing heading: ${heading}`);
    }
  }

  const executionRoot = dirname(options.manifestPath);
  for (const parts of requiredDirectories) {
    const directory = join(executionRoot, ...parts);
    if (!existsSync(directory)) {
      errors.push(`Missing directory: ${directory}`);
    }
  }

  if (errors.length > 0) {
    console.error("BlueprintPilot manifest validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`BlueprintPilot manifest validation passed: ${options.manifestPath}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
