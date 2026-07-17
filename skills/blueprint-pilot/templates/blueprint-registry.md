# Blueprint Registry / 蓝图总账

date:
owner: BlueprintPilot
project_root:
status: initialized

## Purpose

This registry is a project-level navigation asset maintained by BlueprintPilot.

It is not the global BlueprintPilot Skill itself. It records the current project's blueprints, plans, authority documents, closeouts, acceptance reports, and known execution-state drift.

## Operating Rules

- Refresh this registry, or create a registry scan report, before starting or continuing a blueprint execution batch.
- Do not judge a blueprint by its status line alone.
- Compare document status, closeout evidence, current code reality, superseding authority, and current user approval.
- Project-specific registry state must stay inside the project.

## Classification Rules

| Classification | Meaning | Default Action |
|---|---|---|
| `not_started` | Blueprint appears planned but has no execution evidence | Require approval before implementation |
| `partially_landed_doc_stale` | Document status and code reality may disagree | Run plan-reality audit |
| `implemented_pending_closeout` | Work appears landed but lacks closeout | Write or request closeout |
| `completed_with_closeout` | Completed with closeout evidence | Read as history, do not reimplement |
| `superseded_reference` | Absorbed by newer authority | Do not use as execution entry |
| `active_authority_reference` | Current authority, not a batch plan | Use as constraint |
| `active_validation_no_closeout` | Active validation plan with no closeout | Execute or close out |
| `needs_review` | Scanner found it but cannot classify safely | Inspect manually |

## Current Summary

-

## Registry Table

| Document | Detected Status | Evidence | Classification | Next Action |
|---|---|---|---|---|
| - | - | - | `needs_review` | Inspect |

## Latest Scan Reports

-

## Notes

-
