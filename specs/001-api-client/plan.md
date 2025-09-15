# Implementation Plan: CanadianSupermarketApi Client (Superstore v1)

**Branch**: `001-api-client` | **Date**: 2025-09-15 | **Spec**: specs/001-api-client/spec.md
**Input**: Feature specification from `specs/001-api-client/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
3. Evaluate Constitution Check section below
4. Execute Phase 0 → research.md
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific file
6. Re-evaluate Constitution Check section
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Provide a client library exposing three capabilities:
- Product search by keyword or known id with user-specified pagination (store-scoped)
- Store listing for the Superstore banner (no proximity filtering in v1)
- Product details by product id for a given store

Technical approach (per research): integrate with Real Canadian Superstore upstream endpoints using caller-provided credentials; map external DTOs to stable supermarket-agnostic contracts; include regular and unit comparison pricing when available; treat errors via a typed taxonomy and avoid leaking raw upstream structures. No built-in retry/backoff in v1.

## Technical Context

**Language/Version**: Node.js 18 (TypeScript preferred)  
**Primary Dependencies**: None initially (standard `fetch` and AbortController)  
**Storage**: N/A  
**Testing**: Jest (ts-jest) with 100% line and branch coverage enforced; contract/integration suites call the live API and require `SUPERSTORE_API_KEY`
**Target Platform**: Node 18 (library)  
**Project Type**: single  
**Performance Goals**: No explicit latency requirements (best-effort within upstream limits)
**Constraints**: Unofficial upstream subject to change (including header names); credentials must be provided by integrator; prices in CAD and exclude tax; no built-in retry/backoff in v1
**Scale/Scope**: Library consumed by downstream services needing chain-wide coverage; expected call volume aligns with typical application traffic (no special scaling commitments)

## Constitution Check

GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.

**Simplicity**
- Projects ≤ 3 (src/core, src/features, src/config)
- Use framework/runtime directly (no unnecessary wrappers)
- Entities vs DTOs separation present (map at boundaries)
- CLEAN layering affirmed (use-case → repository → datasource)

**Architecture**
- Vertical slices under `src/features/` per capability
- Repositories define domain ports; datasources implement adapters
- Shared domain in `src/core/` (entities, errors, types, mappers)
- Configuration in `src/config/` (env, DI, providers)

**Packaging & Tooling**
- `package.json` configured for public publishing (`private: false`, `publishConfig.access: public`)
- ESM exports map defined for public API
- `tsconfig` path aliases set (@core/*, @features/*, @config/*)
- ESLint rules enforce naming; JSDoc plugin enabled for exported APIs

**Testing (NON-NEGOTIABLE)**
- RED-GREEN-REFACTOR enforced (tests fail before implementation)
- Order: Contract → Integration → E2E → Unit
- Integration tests for new libraries and contract changes

**Observability**
- Structured logging included; error context sufficient

**Versioning**
- SemVer in `package.json` (1.x, follow SemVer for breaking changes)
- Changelog updated for notable changes; breaking changes documented

## Project Structure

### Documentation (this feature)

```
specs/001-api-client/
  plan.md              # This file
  research.md          # Phase 0 output
  data-model.md        # Phase 1 output
  quickstart.md        # Phase 1 output
  contracts/           # Phase 1 output
  tasks.md             # Phase 2 output (created by /tasks, not /plan)
```

### Source Code (repository root)

Option 1: Single project (DEFAULT)

```
src/
  core/
  features/
  config/

tests/
  contract/
  integration/
  unit/
```

**Structure Decision**: Option 1 (Single project) — library with `src/features`, `src/core`, `src/config`, and tests

## Phase 0: Outline & Research

1. Extract unknowns from Technical Context
2. Generate research tasks per unknowns and tech choices
3. Consolidate findings in `research.md` (Decision, Rationale, Alternatives)

Output: research.md with all NEEDS CLARIFICATION resolved

Artifacts created:
- research.md (seeded from observed endpoints and decisions)

## Phase 1: Design & Contracts

Prerequisite: research.md complete

1. Extract entities from feature spec → `data-model.md`
2. Generate API contracts from functional requirements → `/contracts/`
3. Generate contract tests (failing) from contracts
4. Extract integration scenarios from stories → quickstart.md
5. Update agent file for assistants (optional)

Output: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

Artifacts created:
- data-model.md (entities for Product, Pricing, Nutrition, Store)
- contracts/client-api.md (library API contracts)
- quickstart.md (validation steps)

## Phase 2: Task Planning Approach

This section describes what the /tasks command will do - DO NOT execute during /plan

Task Generation Strategy:
- Load `/.codex/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

Ordering Strategy:
- TDD order: Tests before implementation
- Dependency order: Models before services
- Mark [P] for parallel execution (independent files)

Estimated Output: 25-30 numbered, ordered tasks in tasks.md

## Phase 3+: Future Implementation

Beyond scope of /plan
- Phase 3: Tasks generated (/tasks command)
- Phase 4: Implementation
- Phase 5: Validation

## Complexity Tracking

Fill ONLY if Constitution Check has violations that must be justified

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |

No deviations required; architecture remains within constitution guardrails.

Polish follow-ups:
- Add unit tests for SuperstoreAuthError helper paths in datasource.
- Consider exposing machine-readable error codes on public results.
- Evaluate retry/backoff for transient 5xx responses in a minor release.

## Progress Tracking

Phase Status:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
 - [x] Phase 4: Implementation complete
 - [x] Phase 5: Validation passed

Gate Status:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

