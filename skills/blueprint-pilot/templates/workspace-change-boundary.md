# Workspace Change Boundary / 工作树变更边界

date:
project_root:
status: draft

## Purpose

Use this before starting a business-code implementation batch when the repository already has uncommitted changes.

The goal is not to force a commit. The goal is to separate real implementation scope from validation artifacts, generated data, dependency noise, and execution-state documents so the next batch remains auditable.

## Current Git Snapshot

command:

```bash
git status --short
```

summary:

-

## Keep As Intentional Scope

Files or directories that are part of the intended implementation or governance state:

-

## Runtime / Validation Artifacts

Generated files that may be useful as evidence but should not be confused with business implementation:

-

## Dependency / Tooling Noise

Dependency directories, lockfile drift, or package-manager side effects:

-

## Unknown / Needs Owner Decision

Changes that require user confirmation before implementation continues:

-

## Proceed Decision

-
