# ca-supermarket-api Constitution

This constitution defines how this repository is specified, planned, implemented, and validated. It is tailored for an npm package implemented in TypeScript with strict typing, using a CLEAN, vertical-slice architecture.

## Core Principles

### I. Language & Package Baseline
- Node.js: 20 LTS.
- Module system: ESM (`"type": "module"` in `package.json`).
- TypeScript: `"strict": true` (noImplicitAny, strictNullChecks, noUncheckedIndexedAccess, noImplicitOverride, noFallthroughCasesInSwitch).
- tsconfig: `module` = `NodeNext` (ESM), `target` = `ES2022` (adjust as needed), `moduleResolution` = `NodeNext`.
- Testing: Jest (ts-jest or SWC), with watch and coverage tasks.
- Tooling: ESLint + Prettier enforced; CI runs typecheck + lint + tests.

### II. Architecture (CLEAN, Vertical Slices)
- Structure: `src/features/`, `src/core/`, `src/config/`.
- Flow per feature: use-case → repository (port) → datasource (adapter).
- Domain layer uses Entities (in `src/core/entities`); data layer uses DTOs (in `src/features/.../dtos`).
- Mappers translate DTOs ↔ Entities at boundaries; keep mapping pure and tested.
- Errors are typed; define domain errors in `src/core/errors` and use narrow throws/Results.

### III. Testing Policy
- Unit tests for use-cases are required; each use-case must include success and error-path coverage.
- Mapper and validator tests required when introduced.
- TDD is encouraged (write failing tests first) and tests must accompany changes in the same PR.
- Jest is the default runner; integration/contract tests are optional unless a public contract is exposed.
 - No coverage thresholds initially; may be introduced later as the codebase stabilizes.

### IV. Versioning & Releases
- SemVer in `package.json` (0.x.y until stable 1.0.0).
- Document breaking changes with migration notes; maintain a CHANGELOG.

### V. Observability & Errors
- Minimal singleton `Logger` with static methods: `debug/info/warn/error`.
- Default implementation writes to console; allow swapping backend via a static `configure()` method.
- Use structured error types with actionable messages; prefer typed Results or discriminated unions where appropriate.

### VI. Security & Data Handling
- Validate inputs at boundaries; fail closed with typed errors.
- Avoid leaking sensitive data in error messages; sanitize outputs where applicable.

### VII. Naming & Code Style
- Files and directories: snake_case (e.g., `user_profile.ts`, `src/core/errors/`).
- Variables: snake_case (e.g., `user_id`, `order_total`).
- Functions: camelCase (e.g., `createOrder`, `map_to_entity`).
- Classes, interfaces, types, enums: PascalCase (e.g., `OrderEntity`, `CreateOrderUseCase`, `OrderRepository`).
- DTOs: PascalCase with `Dto` suffix (e.g., `OrderDto`).
- Entities: PascalCase with `Entity` suffix (e.g., `OrderEntity`).
- Use-cases: PascalCase with `UseCase` suffix (e.g., `CreateOrderUseCase`).
- Repositories (ports): PascalCase with `Repository` suffix (e.g., `OrderRepository`).
- Datasources (adapters): PascalCase with `DataSource` suffix (e.g., `OrderHttpDataSource`).
- Test files: mirror source and end with `.spec.ts` (e.g., `tests/unit/features/orders/use-cases/create_order_use_case.spec.ts`).
- Exports: prefer named exports for ESM; avoid default exports.

### VIII. Documentation (JSDoc)
- Use JSDoc for all exported classes, interfaces, functions, and types.
- Include `@param`, `@returns`, and `@throws` where applicable; add `@example` and `@remarks` for non-trivial logic.
- Keep documentation synchronized with behavior; update comments when changing public APIs.
- Enforce via ESLint `@eslint-plugin-jsdoc`.

## Development Workflow & Quality Gates
1. Specify: Write a business-focused `spec.md` with user scenarios and acceptance criteria; no implementation details. Mark ambiguities `[NEEDS CLARIFICATION: …]`.
2. Plan: Create `plan.md`; pass Constitution Check; produce `research.md`, `data-model.md`, and any contracts/quickstart if relevant. Re-check after design.
3. Tasks: Generate `tasks.md` in tests-first order; include exact file paths; mark `[P]` only for independent files.
4. Implement: Execute tasks; ensure each use-case has unit tests; prefer RED→GREEN→REFACTOR.
5. Validate: All tests pass; quickstart scenarios (if any) succeed; types are strict and lints clean.

Gates in templates must pass before advancing phases.

## Additional Constraints
- Absolute paths when scripts request them to avoid path issues.
- Keep `specs/<feature>/` artifacts authoritative and updated.
- Keep assistant context files (if used) concise and updated via `update-agent-context.ps1`.

## Governance
- This constitution supersedes other practices here. Exceptions must be documented in the feature’s plan “Complexity Tracking” with rationale and simpler alternatives considered.
- Amendments require: version bump, brief rollout/migration note, and template/checklist sync per `.codex/memory/constitution_update_checklist.md`.
- PR reviews verify compliance with this constitution and gates.

**Version**: 0.1.2 | **Ratified**: 2025-09-15 | **Last Amended**: 2025-09-15
