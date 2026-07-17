import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

type Action = "recommend" | "confirm" | "decline" | "list";

type Options = {
  action: Action;
  projectRoot: string;
  sourceTask: string;
  experienceType: string;
  reusableValue: string;
  evidence: string[];
  scopeBoundary: string;
  reason: string;
};

type LessonMeta = {
  lessonId: string;
  createdAt: string;
  experienceType: string;
  reusableValue: string;
  file: string;
};

function parseArgs(argv: string[]): Options {
  const options: Options = {
    action: "recommend",
    projectRoot: process.cwd(),
    sourceTask: "current BlueprintPilot run",
    experienceType: "",
    reusableValue: "",
    evidence: [],
    scopeBoundary: "Applies only to this project.",
    reason: "user_declined",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--recommend") {
      options.action = "recommend";
      continue;
    }
    if (arg === "--confirm") {
      options.action = "confirm";
      continue;
    }
    if (arg === "--decline") {
      options.action = "decline";
      continue;
    }
    if (arg === "--list") {
      options.action = "list";
      continue;
    }

    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === "--project-root") options.projectRoot = next;
    else if (arg === "--source-task") options.sourceTask = next;
    else if (arg === "--experience-type") options.experienceType = next;
    else if (arg === "--reusable-value") options.reusableValue = next;
    else if (arg === "--evidence") options.evidence.push(next);
    else if (arg === "--scope-boundary") options.scopeBoundary = next;
    else if (arg === "--reason") options.reason = next;
    else throw new Error(`Unknown argument: ${arg}`);

    index += 1;
  }

  return {
    ...options,
    projectRoot: resolve(options.projectRoot),
  };
}

function localLearningRoot(projectRoot: string): string {
  return join(projectRoot, "docs", "architecture", "execution", "local-learning");
}

function lessonsRoot(projectRoot: string): string {
  return join(localLearningRoot(projectRoot), "lessons");
}

function indexPath(projectRoot: string): string {
  return join(localLearningRoot(projectRoot), "lessons-index.md");
}

function skipsPath(projectRoot: string): string {
  return join(localLearningRoot(projectRoot), "skips.md");
}

function latestFile(directory: string): string {
  if (!existsSync(directory)) return "";
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((item) => item.isFile() && item.name !== ".gitkeep")
    .map((item) => join(directory, item.name));
  if (files.length === 0) return "";
  return files.sort((left, right) => {
    return statSync(right).mtimeMs - statSync(left).mtimeMs;
  })[0];
}

function inferEvidence(projectRoot: string): string[] {
  const executionRoot = join(projectRoot, "docs", "architecture", "execution");
  const candidates = [
    latestFile(join(executionRoot, "acceptance-reports")),
    latestFile(join(executionRoot, "retrospectives")),
    latestFile(join(executionRoot, "learning-candidates")),
    latestFile(join(executionRoot, "closeouts")),
  ].filter(Boolean);

  return candidates.map((file) => file.replace(`${projectRoot}/`, ""));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "local-lesson";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function timestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function ensureLocalLearning(projectRoot: string): void {
  mkdirSync(lessonsRoot(projectRoot), { recursive: true });
  if (!existsSync(indexPath(projectRoot))) {
    writeFileSync(indexPath(projectRoot), [
      "# Project Local Learning Index",
      "",
      "status: active",
      "visibility: project_local",
      `updated_at: ${timestamp()}`,
      "",
      "This file indexes reusable lessons saved for this project only.",
      "",
      "Local lessons are project context hints. They do not modify BlueprintPilot, its templates, scripts, adapters, references, or update behavior.",
      "",
      "| Lesson ID | Created At | Experience Type | Reusable Value | Lesson File |",
      "| --- | --- | --- | --- | --- |",
      "",
    ].join("\n"));
  }
}

function parseLesson(filePath: string, projectRoot: string): LessonMeta {
  const content = readFileSync(filePath, "utf8");
  const get = (field: string): string => {
    const match = content.match(new RegExp(`^${field}:\\s*(.*)$`, "m"));
    return match?.[1]?.trim() || "";
  };
  const reusableMatch = content.match(/## Reusable Value\s+([\s\S]*?)\n## /);
  const reusableValue = reusableMatch?.[1]?.trim().replace(/^- /, "") || "";
  return {
    lessonId: get("lesson_id") || basename(filePath, ".md"),
    createdAt: get("created_at"),
    experienceType: get("experience_type"),
    reusableValue,
    file: filePath.replace(`${projectRoot}/`, ""),
  };
}

function refreshIndex(projectRoot: string): void {
  ensureLocalLearning(projectRoot);
  const directory = lessonsRoot(projectRoot);
  const lessons = readdirSync(directory, { withFileTypes: true })
    .filter((item) => item.isFile() && item.name.endsWith(".md"))
    .map((item) => parseLesson(join(directory, item.name), projectRoot))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const lines = [
    "# Project Local Learning Index",
    "",
    "status: active",
    "visibility: project_local",
    `updated_at: ${timestamp()}`,
    "",
    "This file indexes reusable lessons saved for this project only.",
    "",
    "Local lessons are project context hints. They do not modify BlueprintPilot, its templates, scripts, adapters, references, or update behavior.",
    "",
    "| Lesson ID | Created At | Experience Type | Reusable Value | Lesson File |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const lesson of lessons) {
    lines.push(`| ${lesson.lessonId} | ${lesson.createdAt} | ${lesson.experienceType} | ${lesson.reusableValue} | ${lesson.file} |`);
  }
  lines.push("");
  writeFileSync(indexPath(projectRoot), lines.join("\n"));
}

function experienceTopic(experienceType: string): string {
  const value = experienceType.toLowerCase();
  if (value.includes("closeout") || value.includes("收口") || value.includes("恢复") || value.includes("documentation")) {
    return "本项目文档收口 / 状态恢复经验";
  }
  if (value.includes("boundary") || value.includes("边界") || value.includes("验收") || value.includes("acceptance")) {
    return "本项目执行边界 / 验收经验";
  }
  if (value.includes("batch") || value.includes("拆解") || value.includes("复杂") || value.includes("execution")) {
    return "本项目复杂任务拆解 / 执行经验";
  }
  if (value.includes("learning") || value.includes("经验") || value.includes("复盘")) {
    return "本项目复盘 / 经验沉淀";
  }
  return "本项目可复用执行经验";
}

function valueSummary(experienceType: string): string {
  const topic = experienceTopic(experienceType);
  if (topic.includes("文档收口")) {
    return "保存后，后续同项目恢复进度、判断蓝图是否完成、核对 manifest/closeout/retrospective 时可以更快进入正确状态。";
  }
  if (topic.includes("执行边界")) {
    return "保存后，后续同项目遇到类似验收或边界判断时，可以参考本轮如何定义通过标准、证据路径和未完成项。";
  }
  if (topic.includes("复杂任务")) {
    return "保存后，后续同项目处理类似复杂任务时，可以参考本轮的拆解方式、执行节奏和收口方法。";
  }
  if (topic.includes("复盘")) {
    return "保存后，后续同项目复盘类似问题时，可以减少重复解释，直接引用已经确认过的经验。";
  }
  return "保存后，后续同项目相似任务可以把这条经验作为上下文提示，提高执行和验收的一致性。";
}

function decisionSummary(hasEvidence: boolean): string {
  return hasEvidence
    ? "建议保存。当前项目已经留下可引用的执行证据，这条经验可以作为后续同项目任务的上下文提示。"
    : "暂不建议保存。当前缺少可引用的执行证据，保存后对后续项目上下文帮助有限。";
}

function confirmationEffect(hasEvidence: boolean): string {
  return hasEvidence
    ? "如果你确认，会在当前项目的 `docs/architecture/execution/local-learning/` 下创建一条项目本地经验笔记，并更新本项目经验索引。"
    : "如果你确认，仍可保存一条轻量经验笔记；如果你拒绝，则不会创建经验笔记。";
}

function downstreamImpact(hasEvidence: boolean): string {
  return hasEvidence
    ? "保存后，蓝图领航在本项目后续启动、恢复、复盘或执行相似蓝图时，可以读取这条本地项目经验作为上下文提示，帮助减少重复解释并提高同项目执行一致性。"
    : "如果保存为轻量笔记，它只会作为本项目后续上下文提示；由于缺少证据路径，对后续执行的帮助会比较有限。";
}

function recommendation(options: Options): void {
  const evidence = options.evidence.length > 0 ? options.evidence : inferEvidence(options.projectRoot);
  const experienceType = options.experienceType || "project execution lesson";
  const hasEvidence = evidence.length > 0;
  const reusableValue = options.reusableValue || (
    hasEvidence
      ? "后续同项目类似任务可以参考本轮执行边界、验收方式或恢复经验。"
      : "当前缺少可引用的执行证据，暂不建议保存经验。"
  );

  console.log("# Project Local Learning Recommendation");
  console.log("");
  console.log(`decision: ${hasEvidence ? "recommended" : "not_recommended"}`);
  console.log(`project_root: ${options.projectRoot}`);
  console.log(`experience_type: ${experienceType}`);
  console.log("");
  console.log(hasEvidence ? "本轮蓝图执行产生了可以沉淀到本项目的蓝图领航经验：" : "本轮暂不建议沉淀到本项目的蓝图领航经验库：");
  console.log("");
  console.log(`- 经验类型：${experienceType}`);
  console.log(`- 可复用价值：${reusableValue}`);
  console.log("");
  console.log("中文审核摘要：");
  console.log(`- 经验主题：${experienceTopic(experienceType)}`);
  console.log(`- 能力价值：${valueSummary(experienceType)}`);
  console.log(`- 推荐判断：${decisionSummary(hasEvidence)}`);
  console.log(`- 确认后动作：${confirmationEffect(hasEvidence)}`);
  console.log(`- 后续影响：${downstreamImpact(hasEvidence)}`);
  console.log("");
  console.log("建议引用的执行证据：");
  if (hasEvidence) {
    for (const item of evidence) {
      console.log(`- ${item}`);
    }
  } else {
    console.log("- not_recorded");
  }
  console.log("");
  console.log("是否保存到本项目的蓝图领航本地经验库？");
}

function confirm(options: Options): void {
  ensureLocalLearning(options.projectRoot);
  const evidence = options.evidence.length > 0 ? options.evidence : inferEvidence(options.projectRoot);
  const experienceType = options.experienceType || "project execution lesson";
  const reusableValue = options.reusableValue || "后续同项目类似任务可以参考本轮执行边界、验收方式或恢复经验。";
  const lessonId = `${today()}-${slugify(experienceType)}`;
  const filePath = join(lessonsRoot(options.projectRoot), `${lessonId}.md`);
  const uniqueFilePath = existsSync(filePath)
    ? join(lessonsRoot(options.projectRoot), `${lessonId}-${Date.now()}.md`)
    : filePath;

  const content = [
    "# Project Local Lesson",
    "",
    `lesson_id: ${basename(uniqueFilePath, ".md")}`,
    `created_at: ${timestamp()}`,
    "visibility: project_local",
    `source_task: ${options.sourceTask}`,
    `experience_type: ${experienceType}`,
    "user_confirmation: confirmed",
    "",
    "## Reusable Value",
    "",
    `- ${reusableValue}`,
    "",
    "## Project-Local Applicability",
    "",
    "This lesson applies only to the current project unless the user explicitly restates it in another project.",
    "",
    "## Evidence Paths",
    "",
    ...(evidence.length > 0 ? evidence.map((item) => `- ${item}`) : ["- not_recorded"]),
    "",
    "## Scope Boundary",
    "",
    `- ${options.scopeBoundary}`,
    "",
    "## BlueprintPilot Boundary",
    "",
    "This lesson is a project context note. It does not modify BlueprintPilot, its templates, scripts, adapters, references, version, or update behavior.",
    "",
  ].join("\n");

  mkdirSync(dirname(uniqueFilePath), { recursive: true });
  writeFileSync(uniqueFilePath, content);
  refreshIndex(options.projectRoot);
  console.log(`created: ${uniqueFilePath}`);
  console.log(`index: ${indexPath(options.projectRoot)}`);
}

function decline(options: Options): void {
  ensureLocalLearning(options.projectRoot);
  const path = skipsPath(options.projectRoot);
  if (!existsSync(path)) {
    writeFileSync(path, [
      "# Project Local Learning Skips",
      "",
      "status: active",
      "visibility: project_local",
      "",
      "This file records user-declined local learning saves for this project only.",
      "",
      "| Skipped At | Source Task | Reason |",
      "| --- | --- | --- |",
      "",
    ].join("\n"));
  }
  const existing = readFileSync(path, "utf8");
  writeFileSync(path, `${existing}| ${timestamp()} | ${options.sourceTask} | ${options.reason} |\n`);
  console.log(`skipped: ${path}`);
}

function list(options: Options): void {
  const path = indexPath(options.projectRoot);
  if (!existsSync(path)) {
    console.log(`missing: ${path}`);
    return;
  }
  console.log(readFileSync(path, "utf8"));
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  if (options.action === "recommend") recommendation(options);
  else if (options.action === "confirm") confirm(options);
  else if (options.action === "decline") decline(options);
  else if (options.action === "list") list(options);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
