# Approved Execution Patterns

This file stores cross-project BlueprintPilot lessons only after user approval.

Do not add project-specific execution state here. Each pattern must describe how to judge and act in future runs, not merely what happened in one project.

## Pattern Index

1. Approval Status Gate
2. Dependency-Free Governance Script Validation
3. Plan-Reality Sync Gate
4. Cold-Start Recovery Pattern
5. Pre-Implementation Workspace Boundary Gate
6. Outcome-Sized Batch Contract Pattern
7. Design Blueprint To Resumable Execution Plan Pattern
8. Main Control Path Gate Pattern

## Pattern Format

Each approved pattern should answer:

- Trigger
- Decision Rule
- Action Protocol
- Anti-Pattern
- Transfer Boundary
- Evidence Standard

## 1. Approval Status Gate

### Trigger

A user asks BlueprintPilot to execute, continue, or modify work based on a formal blueprint, implementation plan, architecture spec, or execution plan.

### Decision Rule

Document relevance is not execution approval. If the artifact is marked draft, discussion, unapproved, blocked, or otherwise not approved for implementation, BlueprintPilot must not start implementation by default.

### Action Protocol

1. Inspect the artifact's status line, approval marker, and blocking language.
2. If implementation is not approved, switch the first batch to execution admission and scope lock.
3. Report the approval state to the user.
4. Proceed only if the user explicitly approves execution in the current conversation or a newer authority grants approval.

### Anti-Pattern

Do not treat "this is the relevant blueprint" as "this blueprint is approved to implement."

### Transfer Boundary

Applies to formal execution artifacts that could lead to business-code, schema, provider, workflow, or durable documentation changes.

Does not apply to simple read-only reviews, scratch notes, or cases where the user explicitly overrides the stale document status.

### Evidence Standard

The acceptance report or response cites the inspected status marker and records whether the gate proceeded, paused, or converted into an admission batch.

## 2. Dependency-Free Governance Script Validation

### Trigger

BlueprintPilot needs to validate its own Skill scripts, templates, manifest structure, registry scanner, or other lightweight governance helpers.

### Decision Rule

Governance utility validation should use the smallest runtime path that proves the helper works. Package-manager execution is unnecessary when a direct standard-library runtime check is sufficient.

### Action Protocol

1. Prefer direct `node` execution or syntax checks for dependency-free scripts.
2. Use project package-manager commands only for project build, runtime, and contract gates.
3. Stop and reassess if a validation command begins mutating dependency state for a governance-only check.

### Anti-Pattern

Do not run heavy package-manager validation for a lightweight governance script if it can trigger installs, mutate lock state, or bury the signal in dependency noise.

### Transfer Boundary

Applies to Skill utilities and project-independent governance scripts.

Does not apply when the script intentionally depends on project modules, framework loaders, or the package-manager workflow itself.

### Evidence Standard

The report records the exact lightweight command used and confirms no dependency installation was required for the governance check.

## 3. Plan-Reality Sync Gate

### Trigger

The project has historical blueprints, stale specs, closeouts, acceptance reports, or handbooks, and the user asks what remains unfinished or which plan should be executed next.

### Decision Rule

Blueprint text is not the only source of truth. Before deciding whether to execute, continue, close, or archive a blueprint, compare document status with closeout evidence, current code reality, superseding authority, and current user approval.

### Action Protocol

1. Inspect the blueprint's stated status.
2. Inspect closeout and acceptance evidence.
3. Inspect code reality when the blueprint describes implementation contracts.
4. Check whether a newer handbook, manifest, or authority supersedes it.
5. Classify the blueprint as one of:
   - `not_started`
   - `partially_landed_doc_stale`
   - `implemented_pending_closeout`
   - `completed`
   - `superseded`
   - `active_reference_not_execution_plan`
   - `needs_plan_reality_audit`
6. Recommend the next action from the classification, not from the document title alone.

### Anti-Pattern

Do not reimplement already-landed work just because the original blueprint still says draft, and do not mark work complete merely because the blueprint text is confident.

### Transfer Boundary

Applies to long-running repositories with multiple execution documents or repeated refactors.

Does not apply to a fresh one-off change with no prior execution history.

### Evidence Standard

The response, registry, or audit shows document status, closeout status, code reality, supersession status, and recommended next action.

## 4. Cold-Start Recovery Pattern

### Trigger

The user asks BlueprintPilot to inspect a project or continue execution without providing the old conversation context.

### Decision Rule

Conversation memory is optional. Project execution artifacts are the durable state source.

### Action Protocol

1. Read the BlueprintPilot Skill rules.
2. Refresh or inspect the latest blueprint registry scan report.
3. Read `docs/architecture/execution/current-manifest.md`.
4. Read the project blueprint registry.
5. Read the relevant closeout, acceptance report, or plan-reality audit cited by the manifest or registry.
6. Infer the current mainline batch from project artifacts.
7. State the next batch and the evidence behind that choice.

### Anti-Pattern

Do not ask the user to restate long history before checking the project's own execution state.

### Transfer Boundary

Applies when a project has BlueprintPilot execution artifacts or equivalent durable planning state.

Does not apply when no project execution artifacts exist; in that case, create a manifest or ask for the source blueprint.

### Evidence Standard

The answer cites the manifest, registry or scan, and at least one closeout, acceptance report, or audit that supports the inferred next step.

## 5. Pre-Implementation Workspace Boundary Gate

### Trigger

BlueprintPilot is about to start a business-code implementation batch while the worktree is dirty or contains generated/test/dependency noise.

### Decision Rule

A dirty worktree is not automatically a blocker. It becomes a blocker only when unknown or noisy changes would make the next batch unverifiable.

### Action Protocol

1. Run `git status --short`.
2. Classify changes into:
   - intended implementation scope
   - execution governance state
   - validation evidence or generated dev-data
   - dependency/tooling noise
   - unknown changes requiring user decision
3. Pause only for unknown or noisy changes that would compromise verification.
4. Record the boundary in an acceptance report or workspace-change-boundary note.
5. Keep unrelated cleanup out of the current implementation batch unless it is required for verification.

### Anti-Pattern

Do not mix implementation, generated artifacts, dependency churn, and execution docs into one unreviewable commit merely because they appeared during the same session.

### Transfer Boundary

Applies before business-code edits in repositories with prior uncommitted state.

Does not apply to read-only audits or trivial documentation edits where the dirty state cannot affect verification.

### Evidence Standard

The boundary note or acceptance report records the change classes, any paused items, and why the batch remained verifiable.

## 6. Outcome-Sized Batch Contract Pattern

### Trigger

BlueprintPilot is about to implement a coherent batch from a larger blueprint, especially when the batch touches business logic, schema, workflow orchestration, provider/model routing, product-facing behavior, or proof boundaries.

### Decision Rule

Use the parent blueprint for direction and a short batch execution contract for implementation control. The contract must lock proof boundary, allowed scope, out-of-scope items, evidence, gates, and failure criteria. It must not split the work into unnecessary micro-steps.

### Action Protocol

1. Classify the blueprint size:
   - simple: one pass by default;
   - medium: one or two batches;
   - complex: three to five outcome-sized batches.
2. Create a contract with `templates/execution-contract.md` only when the batch needs durable implementation control.
3. Define what the batch must prove and what it explicitly does not prove.
4. Define failure criteria before coding.
5. Run a fragmentation check: if the proposed batch is just "edit file A" or "add field B", merge it into a larger outcome batch.
6. Ask for user confirmation when the contract changes scope, proof boundary, or risk posture.

### Anti-Pattern

Do not replace one large vague plan with many tiny pseudo-rigorous tasks. A batch contract is a boundary lock, not a license to fragment execution.

### Transfer Boundary

Applies to complex or medium blueprint execution where implementation scope and proof boundaries can drift.

Does not apply to simple single-pass tasks that can be safely completed with an inline objective, boundary, and verification note.

### Evidence Standard

The contract or acceptance report explains why the batch size is appropriate, what outcome it proves, why it is not split further, and which evidence gates determine completion.

## 7. Design Blueprint To Resumable Execution Plan Pattern

### Trigger

The user asks BlueprintPilot to analyze, review, or prepare a formal blueprint before execution, and the artifact is strong as a design or strategy document but does not yet define durable execution state, draft artifact locations, outcome batches, or acceptance rubrics.

### Decision Rule

A clear design blueprint is not automatically a resumable execution blueprint. Before execution, BlueprintPilot must classify readiness and identify the smallest revisions needed to make the plan recoverable, batchable, and verifiable.

### Action Protocol

1. Read the blueprint and any project instructions that affect execution.
2. Classify the blueprint as `ready_for_execution`, `revise_before_execution`, `reject_or_superseded`, or `needs_plan_reality_audit`.
3. Check whether the plan has an execution state layer: manifest, registry, acceptance report path, deviation log, and closeout location.
4. Check whether pre-implementation or draft outputs have a safe workspace instead of being mixed into the final product directory too early.
5. Map long phase lists into 3-5 outcome-sized batches when execution would otherwise fragment.
6. Require pass/fail rubrics for acceptance and forward testing.
7. For Skill, plugin, adapter, migration, provider, or durable tooling creation, require the relevant creator or validation workflow, but inspect the current toolchain before citing concrete script names.
8. Before returning `ready_for_execution`, run a final control path consistency check across execution governance, outcome batch mapping, proceed decision, and immediate next step.
9. Recommend revision before execution when these controls are missing or when the first execution action conflicts with the declared governance path, even if the blueprint direction is sound.

### Anti-Pattern

Do not start implementation from a well-written design blueprint merely because its direction is correct. Do not mark a revised blueprint ready while its immediate next step still points to an old phase path that skips the newly required admission, state, or Batch 1 gate. Do not hard-code one creator tool's script names as global BlueprintPilot protocol without inspecting the active toolchain.

### Transfer Boundary

Applies to cross-phase blueprints, refactor plans, Skill or tooling creation plans, and architecture execution proposals that will need multiple turns, multiple batches, or later recovery.

Does not apply to small one-pass edits, read-only commentary, or a blueprint that already has equivalent execution governance and acceptance evidence.

### Evidence Standard

The review response or `templates/blueprint-readiness-review.md` instance records the readiness classification, missing execution-state elements, draft workspace decision, proposed outcome batches, rubric gaps, final control path consistency, and proceed decision.

## 8. Main Control Path Gate Pattern

### Trigger

BlueprintPilot implements, reviews, or accepts any capability that should be reached by a real user action, natural-language command, UI control, API route, workflow hook, scheduled trigger, startup rule, closeout rule, or automation.

### Decision Rule

A capability is not complete merely because its helper code, script, component, or document exists. Acceptance must prove that the real trigger path reaches the capability and produces the expected output or state change.

### Action Protocol

1. Identify the capability being delivered.
2. Identify the real trigger path: user action, natural-language command, UI entrypoint, route, workflow hook, scheduler, startup, or closeout.
3. Verify the trigger exists.
4. Verify the trigger invokes the implementation.
5. Run a minimal realistic path from trigger to result.
6. Run or reason through the negative path: decline, missing data, wrong mode, no permission, unsupported root, or unavailable dependency.
7. Record the gate in the acceptance report with trigger tested, result, evidence, and any remaining limits.

### Anti-Pattern

Do not mark a feature complete because the script works in isolation while the user-facing, automated, or closeout-triggered path never calls it.

Do not accept "documented for future use" as proof that the capability is live.

### Transfer Boundary

Applies to BlueprintPilot itself and to downstream projects supervised by BlueprintPilot.

Especially applies to:

- update reminders;
- feedback or learning harvest;
- local learning;
- channel switching;
- UI buttons and menus;
- API routes;
- scheduled jobs;
- provider routing;
- project recovery;
- closeout prompts.

Does not require a heavy end-to-end test when the task is a pure internal refactor with no changed trigger path, but the acceptance report must explicitly state that no main control path changed.

### Evidence Standard

The acceptance report includes a `Main Control Path Gate` section with:

- `capability_exists`;
- `trigger_exists`;
- `trigger_reaches_capability`;
- `real_path_tested`;
- `negative_path_tested`;
- `trigger_tested`;
- `evidence`;
- `status`.
