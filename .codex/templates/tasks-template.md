# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   â†’ If not found: ERROR "No implementation plan found"
   â†’ Extract: tech stack, libraries, structure
2. Load optional design documents:
   â†’ data-model.md: Extract entities â†’ model tasks
   â†’ contracts/: Each file â†’ contract test task
   â†’ research.md: Extract decisions â†’ setup tasks
3. Generate tasks by category:
   â†’ Setup: project init, dependencies, linting
   â†’ Tests: contract tests, integration tests
   â†’ Core: models, services, CLI commands
   â†’ Integration: DB, middleware, logging
   â†’ Polish: unit tests, performance, docs
4. Apply task rules:
   â†’ Different files = mark [P] for parallel
   â†’ Same file = sequential (no [P])
   â†’ Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   â†’ All contracts have tests?
   â†’ All entities have models?
   â†’ All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Single project (TypeScript)**: `src/` with `features/`, `core/`, `config/`; tests in `tests/unit/`
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths below assume the single-project TypeScript structure

## Phase 3.1: Setup

- [ ] T001 Create folders: `src/features/`, `src/core/`, `src/config/`, `tests/unit/`
- [ ] T002 Initialize npm + TypeScript (strict mode) and Jest; set `package.json` "private": true; add ESM exports map; configure `tsconfig` path aliases (@core/*, @features/*, @config/*)
- [ ] T003 [P] Configure ESLint + Prettier + TypeScript rules; enforce naming conventions (snake_case variables/files, camelCase functions, PascalCase classes/types); enable @eslint-plugin-jsdoc for JSDoc on exported APIs

## Phase 3.2: Tests First (TDD) âš ï¸ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T004 [P] Use-case unit test in `tests/unit/features/[feature]/use-cases/[useCase].spec.ts`
- [ ] T005 [P] Use-case unit test (error path) in `tests/unit/features/[feature]/use-cases/[useCase]-error.spec.ts`
- [ ] T006 [P] Repository port contract test in `tests/unit/features/[feature]/repositories/[repo].spec.ts`
- [ ] T007 [P] Mapper unit test (DTO<->Entity) in `tests/unit/features/[feature]/mappers/[mapper].spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T008 [P] Domain entity in `src/core/entities/[Entity].ts`
- [ ] T009 [P] Use case in `src/features/[feature]/use-cases/[UseCase].ts`
- [ ] T010 [P] Repository interface (port) in `src/core/ports/[Feature]Repository.ts`
- [ ] T011 Repository implementation in `src/features/[feature]/repositories/[Impl]Repository.ts`
- [ ] T012 Datasource in `src/features/[feature]/datasources/[Datasource].ts`
- [ ] T013 DTOs in `src/features/[feature]/dtos/[Dto].ts`
- [ ] T014 Error types in `src/core/errors/[Error].ts`

## Phase 3.4: Integration

- [ ] T015 Wire DI/container in `src/config/container.ts`
- [ ] T016 Provide configuration (env schema) in `src/config/env.ts`
- [ ] T017 Logging adapter and context propagation
- [ ] T018 Export public API surface in `src/index.ts`

## Phase 3.5: Polish

- [ ] T019 [P] Unit tests for mappers/validators in `tests/unit/core/[name].spec.ts`
- [ ] T020 Performance checks (hot paths)
- [ ] T021 [P] Update README and usage examples
- [ ] T022 Remove duplication and improve typing (generics)
- [ ] T023 Run manual scenario from quickstart.md (if applicable)
 - [ ] T024 [P] Add/verify JSDoc for all exported APIs

## Dependencies

- Tests (T004-T007) before implementation (T008-T014)
- T010 (port) blocks T011 (repo impl) and T012 (datasource)
- T015-T018 depend on core pieces compiled
- Implementation before polish (T019-T023)

## Parallel Example

```
# Launch T004-T007 together:
Task: "Use-case unit test in tests/unit/features/[feature]/use-cases/[useCase].spec.ts"
Task: "Use-case unit test (error path) in tests/unit/features/[feature]/use-cases/[useCase]-error.spec.ts"
Task: "Repository port contract test in tests/unit/features/[feature]/repositories/[repo].spec.ts"
Task: "Mapper unit test (DTO<->Entity) in tests/unit/features/[feature]/mappers/[mapper].spec.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file â†’ contract test task [P]
   - Each endpoint â†’ implementation task
2. **From Data Model**:
   - Each entity â†’ model creation task [P]
   - Relationships â†’ service layer tasks
3. **From User Stories**:

   - Each story â†’ integration test [P]
   - Quickstart scenarios â†’ validation tasks

4. **Ordering**:
   - Setup â†’ Tests â†’ Models â†’ Services â†’ Endpoints â†’ Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task

