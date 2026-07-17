import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Options = {
  projectRoot: string;
  writeReport: boolean;
  reportPath: string;
};

type DocKind =
  | "blueprint"
  | "plan"
  | "handbook"
  | "closeout"
  | "acceptance_report"
  | "registry_scan_report"
  | "registry"
  | "manifest"
  | "other";

type DocumentRecord = {
  path: string;
  kind: DocKind;
  title: string;
  status: string;
  date: string;
  modifiedAt: string;
  classification: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(scriptDir, "..");

const ignoredPathParts = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  "_archive",
]);

function parseArgs(argv: string[]): Options {
  const options: Options = {
    projectRoot: process.cwd(),
    writeReport: true,
    reportPath: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--no-write") {
      options.writeReport = false;
      continue;
    }

    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === "--project-root") options.projectRoot = next;
    else if (arg === "--report") options.reportPath = next;
    else throw new Error(`Unknown argument: ${arg}`);
    index += 1;
  }

  return {
    ...options,
    projectRoot: resolve(options.projectRoot),
    reportPath: options.reportPath ? resolve(options.reportPath) : "",
  };
}

function walkMarkdownFiles(root: string): string[] {
  const results: string[] = [];

  function walk(directory: string): void {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      if (ignoredPathParts.has(item.name)) {
        continue;
      }

      const fullPath = join(directory, item.name);

      if (item.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (item.isFile() && item.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  walk(root);
  return results.sort();
}

function firstMatch(content: string, patterns: readonly RegExp[]): string {
  for (const pattern of patterns) {
    const match = content.match(pattern);
    const value = match?.[1]?.trim();
    if (value) {
      return value.replace(/\s{2,}/g, " ");
    }
  }

  return "";
}

function detectKind(path: string, content: string): DocKind {
  const lowerPath = path.toLowerCase();
  const lowerContent = content.slice(0, 2000).toLowerCase();

  if (lowerPath.includes("current-manifest.md")) return "manifest";
  if (lowerPath.includes("acceptance-reports/")) return "acceptance_report";
  if (lowerPath.includes("registry-scan-reports/")) return "registry_scan_report";
  if (lowerPath.includes("blueprint-registry")) return "registry";
  if (lowerPath.includes("closeout")) return "closeout";
  if (lowerPath.includes("handbook")) return "handbook";
  if (lowerPath.includes("blueprint")) return "blueprint";
  if (lowerPath.includes("plan")) return "plan";
  if (lowerContent.includes("status / 状态") && lowerContent.includes("blueprint")) {
    return "blueprint";
  }

  return "other";
}

function classify(record: Omit<DocumentRecord, "classification">): string {
  const combined = `${record.path}\n${record.title}\n${record.status}`.toLowerCase();

  if (record.kind === "closeout") return "completed_with_closeout_evidence";
  if (record.kind === "acceptance_report") return "acceptance_evidence";
  if (record.kind === "registry_scan_report") return "registry_scan_evidence";
  if (record.kind === "registry") return "project_registry";
  if (record.kind === "manifest") return "execution_manifest";

  if (/superseded|archive|archived|historical|retired|替代|归档/.test(combined)) {
    return "maybe_superseded_reference";
  }

  if (/authoritative|权威|handbook/.test(combined)) {
    return "active_authority_reference";
  }

  if (/complete|completed|implemented|已完成|已执行|closeout/.test(combined)) {
    return "maybe_implemented_or_completed";
  }

  if (/draft|discussion|not approved|未批准|讨论稿|待确认/.test(combined)) {
    return "needs_approval_or_plan_reality_check";
  }

  if (/active|执行中|validation|验收/.test(combined)) {
    return "active_validation_or_execution";
  }

  return "needs_review";
}

function readDocument(filePath: string, projectRoot: string): DocumentRecord {
  const content = readFileSync(filePath, "utf8");
  const stat = statSync(filePath);
  const path = relative(projectRoot, filePath);
  const kind = detectKind(path, content);
  const title =
    firstMatch(content, [/^#\s+(.+)$/m, /^title:\s*(.+)$/im]) || basename(filePath);
  const status = firstMatch(content, [
    /^status\s*[:：]\s*(.+)$/im,
    /^状态\s*[:：]\s*(.+)$/im,
    /^Status \/ 状态\s*[:：]\s*(.+)$/im,
    /^overall_status\s*[:：]\s*(.+)$/im,
  ]);
  const date = firstMatch(content, [
    /^date\s*[:：]\s*(.+)$/im,
    /^createdAt\s*[:：]\s*(.+)$/im,
    /^last updated\s*[:：]\s*(.+)$/im,
    /^updated\s*[:：]\s*(.+)$/im,
  ]);
  const base = {
    path,
    kind,
    title,
    status: status || "unknown",
    date: date || "unknown",
    modifiedAt: stat.mtime.toISOString(),
  };

  return {
    ...base,
    classification: classify(base),
  };
}

function documentIsRelevant(record: DocumentRecord): boolean {
  return record.kind !== "other";
}

function registryPaths(projectRoot: string): string[] {
  const executionRoot = join(projectRoot, "docs", "architecture", "execution");
  if (!existsSync(executionRoot)) {
    return [];
  }

  return readdirSync(executionRoot, { withFileTypes: true })
    .filter((item) => item.isFile())
    .map((item) => join(executionRoot, item.name))
    .filter((filePath) => basename(filePath).includes("blueprint-registry"))
    .sort();
}

function staleRegistryHints(records: readonly DocumentRecord[]): string[] {
  const registryRecords = records.filter((record) => record.kind === "registry");
  if (registryRecords.length === 0) {
    return ["No blueprint registry was found in docs/architecture/execution."];
  }

  const latestRegistryTime = Math.max(
    ...registryRecords.map((record) => Date.parse(record.modifiedAt)),
  );
  const trackedKinds = new Set<DocKind>(["blueprint", "plan", "handbook"]);
  const newerDocs = records.filter((record) => {
    if (!trackedKinds.has(record.kind)) return false;
    return Date.parse(record.modifiedAt) > latestRegistryTime;
  });

  if (newerDocs.length === 0) {
    return ["No scanned blueprint document is newer than the latest registry file."];
  }

  return newerDocs
    .slice(0, 20)
    .map((record) => `${record.path} changed after the latest registry.`);
}

function markdownTable(records: readonly DocumentRecord[]): string {
  const rows = records.map((record) =>
    [
      record.path,
      record.kind,
      record.status,
      record.classification,
      record.modifiedAt.slice(0, 10),
    ]
      .map((value) => value.replace(/\|/g, "\\|"))
      .join(" | "),
  );

  return [
    "| Document | Kind | Status | Scanner Classification | Modified |",
    "|---|---|---|---|---|",
    ...rows.map((row) => `| ${row} |`),
  ].join("\n");
}

function buildReport(input: {
  projectRoot: string;
  records: readonly DocumentRecord[];
  generatedAt: string;
}): string {
  const counts = new Map<string, number>();
  for (const record of input.records) {
    counts.set(record.kind, (counts.get(record.kind) || 0) + 1);
  }

  const countLines = Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([kind, count]) => `- ${kind}: ${count}`);
  const hints = staleRegistryHints(input.records);

  return [
    "# Blueprint Registry Scan Report",
    "",
    `generated_at: ${input.generatedAt}`,
    `project_root: ${input.projectRoot}`,
    `total_records: ${input.records.length}`,
    "",
    "## Summary",
    "",
    ...countLines,
    "",
    "## Registry Freshness Hints",
    "",
    ...hints.map((hint) => `- ${hint}`),
    "",
    "## Scanned Documents",
    "",
    markdownTable(input.records),
    "",
    "## Notes",
    "",
    "- This scanner detects document state signals only.",
    "- It does not prove code reality by itself.",
    "- Use BlueprintPilot Plan-Reality Guard before implementation decisions.",
    "",
  ].join("\n");
}

function writeLatestReportCopy(reportPath: string, report: string): void {
  const latestPath = join(dirname(reportPath), "latest-blueprint-registry-scan.md");
  writeFileSync(latestPath, report, "utf8");
}

function ensureRegistry(projectRoot: string, allowCreate: boolean): string {
  const existing = registryPaths(projectRoot)[0];
  if (existing) {
    return existing;
  }

  const executionRoot = join(projectRoot, "docs", "architecture", "execution");
  const registryPath = join(executionRoot, "blueprint-registry.md");
  if (!allowCreate) {
    return registryPath;
  }

  const templatePath = join(skillRoot, "templates", "blueprint-registry.md");
  const template = readFileSync(templatePath, "utf8")
    .replace("date:", `date: ${new Date().toISOString().slice(0, 10)}`)
    .replace("project_root:", `project_root: ${projectRoot}`);

  mkdirSync(executionRoot, { recursive: true });
  writeFileSync(registryPath, template, "utf8");
  return registryPath;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.projectRoot)) {
    throw new Error(`Project root does not exist: ${options.projectRoot}`);
  }

  const registryPath = ensureRegistry(options.projectRoot, options.writeReport);
  const files = walkMarkdownFiles(join(options.projectRoot, "docs"));
  const records = files
    .map((filePath) => readDocument(filePath, options.projectRoot))
    .filter(documentIsRelevant);
  const generatedAt = new Date().toISOString();
  const report = buildReport({
    projectRoot: options.projectRoot,
    records,
    generatedAt,
  });
  const reportPath =
    options.reportPath ||
    join(
      options.projectRoot,
      "docs",
      "architecture",
      "execution",
      "registry-scan-reports",
      `${generatedAt.replace(/[:.]/g, "-")}-blueprint-registry-scan.md`,
    );

  if (options.writeReport) {
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, report, "utf8");
    writeLatestReportCopy(reportPath, report);
  }

  console.log(`Blueprint registry: ${relative(options.projectRoot, registryPath)}`);
  console.log(`Scanned records: ${records.length}`);
  console.log(`Report: ${options.writeReport ? relative(options.projectRoot, reportPath) : "not written"}`);
  if (options.writeReport) {
    console.log(`Latest: ${relative(options.projectRoot, join(dirname(reportPath), "latest-blueprint-registry-scan.md"))}`);
  }
  for (const hint of staleRegistryHints(records).slice(0, 5)) {
    console.log(`Hint: ${hint}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
