---
name: blueprint-pilot
description: Use when Codex needs to execute, continue, audit, or close out a complex implementation blueprint without drifting: execution plans, refactor blueprints, "continue according to the plan", "where are we in the blueprint", "do not go off track", staged delivery, acceptance reports, retrospectives, and reusable execution-learning capture across projects.
---

# BlueprintPilot / 蓝图领航

BlueprintPilot turns a complex execution blueprint into a controlled, resumable, evidence-backed delivery loop.

Use it to keep long work from becoming fragmented, chat-memory-dependent, or detached from the approved plan.

## Core Rule

Do not start implementation from conversation memory alone.

Always anchor the run in one of these:

1. The user-provided blueprint path.
2. The project manifest at `docs/architecture/execution/current-manifest.md`.
3. A newly created manifest based on `templates/execution-manifest.md`.

## Version and Update Awareness

BlueprintPilot should help users discover updates without behaving like a background app.

At the start of a material BlueprintPilot run, and especially when the user asks about installation, updates, version problems, stale behavior, or "why does this Skill seem different", check update status if it is reasonable to do so:

- read `VERSION` from the installed Skill root;
- run `scripts/check-update.sh` when network access is available and the check has not already run recently;
- treat update-check failure as non-blocking;
- if a newer version is available, report the local and latest versions and ask before updating;
- never update silently in the middle of a blueprint run;
- use `scripts/update-self.sh` only after the user confirms;
- `scripts/update-self.sh` supports both managed Git installs and direct-copy installs.

The update check is an adoption aid, not an execution gate. Do not let a failed or skipped update check block normal blueprint navigation.

## Local Channel Marker

If the installed Skill root contains `.blueprintpilot-channel.json`, read it when the user asks about installation source, update behavior, local test mode, or which BlueprintPilot version Codex is currently using.

Treat the marker as local installation metadata only.

When the marker says the current mode is `user-simulation` or the channel is `open-core-test`, do a project-root safety check before writing execution artifacts:

- sandbox or temporary projects are allowed;
- real internal projects should use a disposable clone before user-mode testing;
- user-mode test artifacts must not be mixed into real project execution docs or developer-mode feedback records.

The channel marker does not override the user's request, the active blueprint, code reality, or verification gates.

## Natural Language Channel Commands

When the user asks in plain language to switch or inspect BlueprintPilot mode, map the request to the local channel script when the BlueprintPilot source checkout is available in the current environment.

Use these mappings:

- "将蓝图领航切换到开发模式", "切换到开发模式", "切回开发模式", or "切回 internal" means run `scripts/switch-installed-channel.sh internal-dev`.
- "将蓝图领航切换到用户模式", "切换到用户模式", "切换到 Open Core Test", or "模拟用户版" means run `scripts/switch-installed-channel.sh open-core-test`.
- "目前蓝图领航处于什么模式", "查看当前模式", "确认当前模式", or "蓝图领航现在是什么版本/通道" means run `scripts/switch-installed-channel.sh status`.
- "检查这个项目能不能用于用户模式测试" means run `scripts/switch-installed-channel.sh check-project-root --project-root <current project root>`.

After switching to `open-core-test`, remind the user to test only inside the user-mode sandbox or a disposable clone. After user-mode validation, switch back to `internal-dev` unless the user explicitly asks to stay in user mode.

## Startup Workflow

1. Read the active blueprint or manifest. If none was provided, recover state from the project execution artifacts before asking for context.
2. Identify the current project root and whether a project adapter applies.
3. Read the relevant adapter from `adapters/` only when it matches the current project.
4. Refresh the project blueprint registry scan when the project has docs:
   - run `scripts/scan-blueprint-registry.ts` or inspect the latest scan report
   - keep the registry inside the project execution directory
   - use scan output as navigation evidence, not as automatic proof of implementation
5. Apply cold-start recovery when needed:
   - inspect `current-manifest.md`
   - inspect the project blueprint registry
   - inspect the latest registry scan report
   - inspect `docs/architecture/execution/local-learning/lessons-index.md` when it exists
   - inspect cited closeout, acceptance report, or plan-reality audit evidence
   - infer the current mainline batch from project artifacts, not conversation memory
6. Apply the approval and plan-reality gates:
   - inspect the blueprint's own status or approval marker
   - check for closeout evidence
   - compare with current code reality when the blueprint mentions implementation contracts
   - check whether a newer authority supersedes the blueprint
7. Before business-code edits in a dirty worktree, run a workspace boundary check:
   - classify intended implementation changes, execution docs, validation artifacts, dependency/tooling noise, and unknown changes
   - pause only when unknown or noisy changes would make the next batch unverifiable
   - record the boundary in the acceptance report or a workspace-change-boundary note
8. Establish an outcome-sized execution contract before edits:
   - objective
   - parent blueprint
   - current batch
   - proof boundary
   - allowed scope
   - out of scope
   - target modules or stages
   - acceptance method
   - verification gates
   - required evidence
   - failure criteria
   - fragmentation check
9. Implement the current coherent outcome batch.
10. Run the gates appropriate to the blast radius.
11. Run the Main Control Path Gate for each user-visible, automated, or closeout-triggered capability touched by the batch.
12. Update project state and write an acceptance report.
13. At blueprint closeout, write a navigator retrospective and learning candidates.
14. When a run produced a reusable project-local lesson, ask whether to save it to the current project's local learning library.

## Batch Rules

Split blueprints into 3-5 coherent outcome batches by result, not by files.

Use the smallest number of batches that preserves verification quality.

- Complex blueprints should usually be split into 3-5 outcome-sized batches.
- Medium blueprints should usually finish in 1-2 batches.
- Simple blueprints should default to one pass and should not create a standalone contract unless the user or risk profile requires it.

Create a batch execution contract with `templates/execution-contract.md` before business-code implementation when:

- the batch modifies durable business logic, schema, workflow, provider routing, or production-facing behavior;
- the batch depends on proof boundaries that could be confused with product success;
- the batch needs user confirmation before crossing into implementation;
- the worktree or blueprint history makes verification easy to blur.

Do not create contracts just for ceremony. A short inline boundary statement is enough for simple, single-pass work.

Good batches:

- Establish validation boundary.
- Run a real thin-slice acceptance loop.
- Connect retrieval to stage generation.
- Close out with evidence and retrospective.

Weak batches:

- Edit file A.
- Add field B.
- Check one odd record.
- Chase an unrelated local anomaly.
- Split a single coherent result into many tiny steps.

If a discovered issue does not block the current batch acceptance, inspect only one layer, record it, and return to the main line.

## State Rules

Project execution state belongs in the project, not in this global skill.

Default project state location:

```text
docs/architecture/execution/
  current-manifest.md
  blueprint-registry.md
  deviation-log.md
  acceptance-reports/
  closeouts/
  retrospectives/
  learning-candidates/
  registry-scan-reports/
  workspace-change-boundaries/
```

Global skill files may store templates, adapters, scripts, and approved generic patterns. They must not store project progress.

## Blueprint Registry

The Blueprint Registry is part of the BlueprintPilot operating system, but its content belongs to each project.

BlueprintPilot owns the registry protocol:

- initialize a project registry when missing
- scan blueprint, plan, handbook, closeout, acceptance report, and manifest files
- detect stale registry hints and missing closeout signals
- use the scan report before choosing execution targets

The project owns the registry data:

- registry files remain under `docs/architecture/execution/`
- scan reports remain under `docs/architecture/execution/registry-scan-reports/`
- the global Skill must not store project-specific registry state

Registry scans are navigation evidence only. They do not replace code inspection, plan-reality audit, user approval, or acceptance tests.

## Scope Guard

For every batch, classify new findings as:

- `blocker`: prevents current acceptance; fix or stop with evidence.
- `related_non_blocker`: record in manifest or acceptance report; do not expand the batch.
- `unrelated`: record as follow-up; do not chase.

Any deviation from the blueprint must be written to `deviation-log.md`.

## Workspace Boundary

Dirty worktrees are common in long blueprint work. They are not automatically blockers.

Before starting a business-code batch, inspect `git status --short` and separate:

- intended implementation scope
- execution governance state
- validation evidence or generated dev-data
- dependency/tooling noise
- unknown changes that need user decision

Use `templates/workspace-change-boundary.md` when the boundary is non-trivial. This keeps later acceptance from mixing real implementation, test artifacts, registry updates, and package-manager side effects.

## Validation Guard

Do not treat a passing engineering gate as proof of product, creative, or business success.

Use the project adapter to distinguish:

- engineering checks
- runtime checks
- real-model or real-business acceptance
- manual review

If a project has a fail-closed rule for real validation, do not replace it with mock or fallback evidence.

## Main Control Path Gate

Do not treat an implemented capability as complete until its real trigger path is verified.

For any feature, workflow, automation, update prompt, local learning flow, feedback flow, UI action, API route, CLI command, scheduled task, or Skill behavior, acceptance must prove:

1. Capability exists: the underlying code, script, template, config, or component exists.
2. Trigger exists: the user action, natural-language command, UI control, API route, workflow hook, scheduled trigger, or closeout/startup rule exists.
3. Trigger reaches capability: the entrypoint actually invokes the implementation.
4. Real path works: a minimal realistic path runs from user/system action to output and state change.
5. Negative path works: decline, missing data, wrong mode, no permission, or unsupported project root does not fail silently.
6. Evidence is recorded: the acceptance report states the trigger tested, result, and remaining limits.

If the real trigger path is not verified, mark the batch as incomplete or accepted with a blocker, even when helper scripts or unit checks pass.

For blueprint readiness review, check whether each proposed capability defines its eventual main control path. If it does not, require revision before execution or add the missing trigger path to the first implementation batch.

## Plan-Reality Guard

Do not treat blueprint text as the only source of truth.

Before recommending implementation from a blueprint, classify it by comparing:

- document status
- closeout evidence
- current code reality
- superseding handbooks or authority docs
- current user approval

If the blueprint is unapproved but partially implemented, recommend a plan-reality audit before new implementation. If it is superseded, route work through the newer authority. If it is completed but lacks closeout, write or request closeout rather than reimplementing.

## Blueprint Readiness Review

When the user asks BlueprintPilot to review, audit, or judge a blueprint before execution, run an execution admission review instead of starting implementation.

Use `templates/blueprint-readiness-review.md` when the review is material, cross-phase, or likely to guide later execution.

Classify the blueprint as one of:

- `ready_for_execution`
- `revise_before_execution`
- `reject_or_superseded`
- `needs_plan_reality_audit`

The review must distinguish a good design blueprint from a resumable execution blueprint.

Check whether the blueprint defines or needs:

- approval or execution admission status
- project execution state location
- manifest, registry, acceptance reports, and deviation log
- draft artifact workspace for pre-implementation outputs
- 3-5 outcome-sized batches when the blueprint is complex
- pass/fail rubric for acceptance and forward testing
- explicit proof boundaries
- special creation gates for Skills, plugins, adapters, migrations, providers, or other durable tooling

Before upgrading a blueprint from `revise_before_execution` to `ready_for_execution`, run a final control path consistency check:

- identify the first execution action the blueprint tells the next agent to take
- compare it with execution governance, outcome batch mapping, proceed decision, and immediate next step
- check that approval, execution-state initialization, manifest or registry creation, and Batch 1 gates are not skipped
- check for old phase-path residue such as an immediate jump to Phase 1 when Batch 1 says approval or state initialization comes first
- state any conditions on readiness, for example `ready after explicit approval and execution-state initialization`

If the first execution action conflicts with the governance or batch mapping, keep the review at `revise_before_execution` until the control path is corrected.

For Skill or plugin creation plans, do not hard-code another creator tool's implementation details into BlueprintPilot's core rules. Require the plan to use the relevant creator Skill or current local validation toolchain, and cite the concrete scripts only after inspecting that toolchain in the current environment.

## Learning Loop

BlueprintPilot improves through controlled retrospectives, not silent self-editing.

At the end of a complete blueprint or major batch:

1. Write a navigator retrospective with `templates/navigator-retrospective.md`.
2. Apply `references/learning-extraction-rules.md` before writing learning candidates.
3. Write learning candidates with `templates/learning-candidate.md`, or state that there is nothing reusable.
4. Separate fact, judgment, and reusable rule. Do not preserve a raw event as "learning" unless it becomes an operational decision rule.
5. Ask for approval before upgrading this skill, a template, a script, an adapter, or `references/approved-execution-patterns.md`.
6. Never promote a one-project accident into a global rule without context and approval.

Every reusable learning candidate must define:

- trigger
- decision rule
- action protocol
- anti-pattern
- transfer boundary
- evidence standard

For complex-system acceptance, state what the batch proves, what it does not prove, and what proof is required next.


## User Local Learning

User Local Learning is project-local and user-confirmed.

It is different from improving BlueprintPilot itself:

- local lessons belong to the current project;
- local lessons are context hints, not global rules;
- local lessons must not modify BlueprintPilot, templates, scripts, adapters, references, version, or update behavior;
- local lessons must not be read from other projects;
- local lessons must not create a global personal memory;
- local lessons must not upload data.

Default location:

```text
docs/architecture/execution/local-learning/
  lessons-index.md
  lessons/
  skips.md
```

At closeout, when there is a reusable lesson for the current project, ask one short question:

```text
本轮蓝图执行产生了可以沉淀到本项目的蓝图领航经验：

- 经验类型：<type>
- 可复用价值：<value>
- 中文审核摘要：
  - 经验主题：<topic>
  - 能力价值：<value_summary>
  - 推荐判断：<decision_summary>
  - 确认后动作：<confirmation_effect>
  - 后续影响：<project_local_downstream_impact>
- 建议引用的执行证据：
  - <project-local evidence path>

是否保存到本项目的蓝图领航本地经验库？
```

If the user confirms, write the lesson under the current project's `local-learning/` directory.

If the user declines, do not create a lesson. If useful, append a project-local skip note.

If the user explicitly asks to save or沉淀 the current project lesson, treat that as confirmation after showing or checking the recommendation. Do not ask the user to copy a command.

During startup, cold-start recovery, or blueprint readiness review, inspect only the current project's `local-learning/lessons-index.md` when it exists. Treat lessons as context hints. They never override the user's current request, the active blueprint, code reality, scope boundaries, or verification gates.

## Bundled Resources

- `templates/execution-manifest.md`: project state entrypoint.
- `templates/execution-contract.md`: outcome-sized batch execution contract.
- `templates/acceptance-report.md`: batch acceptance report.
- `templates/batch-closeout.md`: phase or blueprint closeout.
- `templates/deviation-log.md`: deviation record.
- `templates/navigator-retrospective.md`: execution-process retrospective.
- `templates/learning-candidate.md`: controlled learning upgrade proposal.
- `templates/blueprint-readiness-review.md`: execution admission review for blueprints that are not ready to execute yet.
- `templates/project-adapter.md`: adapter authoring template.
- `templates/blueprint-registry.md`: project-level blueprint registry template.
- `templates/workspace-change-boundary.md`: dirty worktree boundary note template.
- `templates/local-learning-index.md`: project-local learning index template.
- `templates/local-learning-lesson.md`: project-local lesson template.
- `templates/local-learning-skip-log.md`: project-local learning skip log template.
- `references/approved-execution-patterns.md`: approved cross-project lessons.
- `references/learning-extraction-rules.md`: rules for turning execution history into reusable judgment.
- `references/user-local-learning-rules.md`: rules for project-local user learning.
- `scripts/create-execution-state.ts`: create project execution state without overwriting existing files.
- `scripts/validate-manifest.ts`: validate required manifest fields and execution directories.
- `scripts/scan-blueprint-registry.ts`: scan project blueprint documents and write a registry scan report.
- `scripts/local-learning.ts`: recommend, save, decline, and list project-local lessons.

Run scripts with Node:

```bash
node /Users/jiaoyue/.codex/skills/blueprint-pilot/scripts/validate-manifest.ts --project-root .
node /Users/jiaoyue/.codex/skills/blueprint-pilot/scripts/scan-blueprint-registry.ts --project-root .
```
