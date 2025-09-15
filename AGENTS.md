# Spec-Driven Development Guide

This repository uses a spec-driven workflow defined in the `.codex` folder. The process moves an idea through clear phases: specify → plan → tasks → implementation → validation. Scripts and templates inside `.codex` keep artifacts consistent and enforce standards.

## What’s In `.codex`

- `/.codex/commands/`
  - `specify.md` — Playbook to create/update a business spec from a natural-language feature description.
  - `plan.md` — Playbook to create an implementation plan and design artifacts from the spec.
  - `tasks.md` — Playbook to generate an actionable, dependency-ordered `tasks.md` from design docs.
- `/.codex/templates/`
  - `spec-template.md` — Business-level feature specification (user scenarios, acceptance criteria, functional requirements; no implementation details).
  - `plan-template.md` — Engineering plan (technical context, constitution gates, design phases and outputs).
  - `tasks-template.md` — Tasks format and generation rules (TDD first, ordering, [P] for parallelizable tasks).
  - `agent-file-template.md` — Template used to maintain assistant context files (e.g., `CLAUDE.md`, `.github/copilot-instructions.md`, `GEMINI.md`).
- `/.codex/scripts/powershell/`
  - `create-new-feature.ps1` — Creates the feature branch and seeds `specs/<###-feature>/spec.md` from the spec template.
  - `setup-plan.ps1` — Ensures the feature folder exists and seeds `plan.md` from the plan template.
  - `check-task-prerequisites.ps1` — Verifies the documents needed for task generation are present.
  - `update-agent-context.ps1` — Updates assistant guide files from the latest plan (Claude/Copilot/Gemini).
  - `get-feature-paths.ps1`, `common.ps1` — Shared helpers and path utilities.
- `/.codex/memory/`
  - `constitution.md` — Project principles (e.g., simplicity, TDD, contracts first, observability, versioning).
  - `constitution_update_checklist.md` — Checklist for keeping templates/docs in sync when the constitution changes.

## Feature Artifact Layout

Artifacts for each feature live under `specs/<###-feature-name>/`:

- `spec.md` — Business spec (Specify phase)
- `plan.md` — Implementation plan (Plan phase)
- `research.md` — Decisions and resolved unknowns
- `data-model.md` — Entities and relationships
- `contracts/` — API contracts and related stubs/tests
- `quickstart.md` — End-to-end validation steps
- `tasks.md` — Actionable, ordered tasks (Tasks phase)

Branch names must start with a three-digit prefix, e.g. `001-checkout-flow`. Scripts use this to resolve the feature directory.

## Workflow

1) Specify (business spec)

- Goal: Capture user value, scope, and acceptance criteria without implementation details.
- Run:
  - PowerShell 7+: `pwsh -NoProfile -File .codex/scripts/powershell/create-new-feature.ps1 -Json "Short feature description"`
  - Windows PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File .codex\scripts\powershell\create-new-feature.ps1 -Json "Short feature description"`
- Output: `specs/<branch>/spec.md` using `/.codex/templates/spec-template.md`.
- Gates: Mandatory sections complete; ambiguities marked as `[NEEDS CLARIFICATION: …]`; no tech stack decisions.

2) Plan (engineering plan and design)

- Goal: Define technical context, pass constitution checks, and generate design artifacts.
- Seed plan: `pwsh -NoProfile -File .codex/scripts/powershell/setup-plan.ps1 -Json`
- Author `plan.md` by following `/.codex/templates/plan-template.md`:
  - Phase 0: Write `research.md` resolving unknowns.
  - Phase 1: Produce `data-model.md`, `contracts/`, `quickstart.md`.
  - Stop before creating `tasks.md` (described only).
- Optional: Update agent context files: `pwsh -NoProfile -File .codex/scripts/powershell/update-agent-context.ps1 copilot` (or `claude`/`gemini`).

3) Tasks (executable plan of work)

- Goal: Produce a numbered, dependency-ordered `tasks.md` that an LLM or engineer can execute.
- Verify prerequisites: `pwsh -NoProfile -File .codex/scripts/powershell/check-task-prerequisites.ps1 -Json`
- Generate tasks using `/.codex/templates/tasks-template.md` and available design docs:
  - From contracts → contract test tasks + endpoint implementation tasks
  - From data model → model tasks + service relationships
  - From user stories → integration test tasks
- Rules: TDD order (tests before implementation), exact file paths, `[P]` only when files don’t overlap.

4) Implement

- Execute tasks in order; group `[P]` tasks when safe.
- Follow RED → GREEN → REFACTOR; maintain observability and versioning.

5) Validate

- Contracts and integration tests pass; quickstart flows work; performance goals and logs verified.

## Notes for Agents/Humans

- Treat `/.codex/commands/*.md` as authoritative playbooks; scripts scaffold and validate.
- Use absolute paths when a playbook asks for them.
- Keep `spec.md` business-focused; move technical detail to `plan.md` and design docs.
- After updating `/.codex/memory/constitution.md`, follow `constitution_update_checklist.md` and update this file if needed.

