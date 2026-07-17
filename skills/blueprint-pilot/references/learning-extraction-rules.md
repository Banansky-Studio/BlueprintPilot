# Learning Extraction Rules

BlueprintPilot must learn execution judgment, not project trivia.

Use this protocol when converting a retrospective, acceptance report, user correction, or failed route into a reusable learning candidate.

## Core Principle

Do not preserve an event merely because it happened.

Preserve only the reusable decision rule that helps a future run choose a better route, avoid a false completion claim, or verify work with less drift.

## Three-Layer Extraction

Every learning candidate must pass through three layers before it can be proposed for promotion.

### 1. Fact Layer

Record the concrete event and evidence.

- What happened?
- Which blueprint, batch, gate, file, command, or report proves it?
- What passed, failed, or stayed intentionally out of scope?
- Was the result project-specific or broadly reusable?

### 2. Judgment Layer

Explain why the event matters.

- What risk did the chosen route avoid?
- What would likely go wrong if BlueprintPilot ignored this lesson?
- Was the issue caused by scope drift, false validation, stale documents, noisy workspace state, weak evidence, or unclear approval?
- Is the lesson about execution routing, validation, state recovery, user approval, or product-proof boundaries?

### 3. Rule Layer

Convert the judgment into an operational rule.

- What should trigger this rule in a future project?
- What should BlueprintPilot do when the trigger appears?
- What should BlueprintPilot avoid doing?
- What evidence proves the rule was followed?
- Where should the rule live: `SKILL.md`, a template, a script, an adapter, or `approved-execution-patterns.md`?

## Required Candidate Fields

Every reusable learning candidate must answer these questions.

### Trigger

When should this lesson activate?

### Decision Rule

What judgment should BlueprintPilot make when the trigger appears?

### Action Protocol

What concrete steps should the agent take?

### Anti-Pattern

What tempting but wrong behavior should be prevented?

### Transfer Boundary

Where does this lesson apply, and where does it not apply?

### Evidence Standard

What evidence proves the lesson was applied correctly?

## Promotion Levels

Use the smallest sufficient upgrade.

- `candidate_only`: keep as project learning until repeated or approved.
- `template_upgrade`: improve future documentation shape.
- `adapter_upgrade`: project-family-specific rule.
- `script_upgrade`: automate a repeated deterministic check.
- `skill_rule_upgrade`: change BlueprintPilot's core operating protocol.
- `approved_pattern`: add to `references/approved-execution-patterns.md` after explicit user approval.

## Promotion Gate

A candidate can become a global approved pattern only when it satisfies most of these checks.

- It prevents repeated drift, rework, false completion, or unsafe implementation.
- It is not merely a one-project business fact.
- It can be written as a clear operational rule.
- It includes a trigger and a bounded action protocol.
- It includes an anti-pattern.
- It has real execution evidence.
- The user approved the promotion.

## Rejection Rules

Do not promote:

- one-off workarounds;
- project-private business details;
- raw chronology without a reusable decision rule;
- unverified assumptions;
- a rule that would make BlueprintPilot slower or more bureaucratic without reducing meaningful risk;
- a rule that conflicts with a project adapter or user-approved plan.

## Proof Boundary Rule

For complex systems, every acceptance report should state:

- what this proves;
- what this does not prove;
- what the next proof must demonstrate.

This prevents engineering success, mock success, or lifecycle success from being mistaken for product, creative, or business success.
