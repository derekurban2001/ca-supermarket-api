# Tasks: CanadianSupermarketApi Client (Superstore v1)

**Input**: Design documents from `specs/001-api-client/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md and extract tech stack (Node 18 + TypeScript, Jest), structure (single project)
2. Load data-model.md (entities: Product, Pricing, Nutrition, Store)
3. Load contracts/ (searchProducts, listStores, getProductDetails)
4. Load research.md and quickstart.md for decisions and scenarios
5. Generate TDD-first tasks with explicit paths and dependencies
```

## Format: [ID] [P?] Description

- [P]: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- Single project (TypeScript): `src/` with `features/`, `core/`, `config/`; tests in `tests/`

## Phase 3.1: Setup

- [x] T001 Create folders: `src/core/entities/`, `src/core/errors/`, `src/core/ports/`, `src/features/catalog/use-cases/`, `src/features/catalog/repositories/`, `src/features/catalog/datasources/`, `src/features/catalog/dtos/`, `src/features/catalog/mappers/`, `src/config/`, `tests/contract/client-api/`, `tests/integration/catalog/`, `tests/unit/features/catalog/use-cases/`, `tests/unit/features/catalog/mappers/`, `tests/unit/core/errors/`
- [x] T002 Initialize project (ESM, TypeScript, Jest)
  - Create `package.json` (public package: `private: false`, `publishConfig.access: public`, type `module`, scripts: build, test, lint, format)
  - Add devDeps: `typescript`, `ts-jest`, `jest`, `@types/jest`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-jsdoc`, `eslint-config-prettier`, `prettier`
  - Create `tsconfig.json` with path aliases: `@core/*`, `@features/*`, `@config/*`
  - Create `jest.config.ts` (ts-jest, ESM, roots `src`, `tests`)
- [x] T003 [P] Configure lint/format
  - Add `.eslintrc.cjs` with TypeScript + JSDoc rules; enable naming conventions
  - Add `.prettierrc` and `.prettierignore`

## Phase 3.2: Tests First (TDD) — MUST COMPLETE BEFORE 3.3

Contract tests (from specs/001-api-client/contracts/client-api.md)
- [x] T004 [P] Contract test for `searchProducts` in `tests/contract/client-api/searchProducts.contract.spec.ts`
  - Import `{ searchProducts }` from `src/index.ts`
  - Assert function signature `(query: string, storeId: string, page: number, pageSize: number) => Promise<Result<{ items: ProductSummary[]; page: number; pageSize: number; total: number | null }>>`
  - Assert stable ordering for identical inputs (mock repository)
- [x] T005 [P] Contract test for `listStores` in `tests/contract/client-api/listStores.contract.spec.ts`
  - Import `{ listStores }` from `src/index.ts`
  - Assert shape: `{ items: StoreSummary[] }` with required fields
- [x] T006 [P] Contract test for `getProductDetails` in `tests/contract/client-api/getProductDetails.contract.spec.ts`
  - Import `{ getProductDetails }` from `src/index.ts`
  - Assert shape includes pricing `{ current, regular?, currency: 'CAD', unitPrice? }`

Integration tests (from quickstart.md scenarios)
- [x] T007 [P] Quickstart flow test in `tests/integration/catalog/quickstart.spec.ts`
  - Exercise the live API (requires `SUPERSTORE_API_KEY`) and verify: listStores → searchProducts → getProductDetails

Use-case and mapper unit tests
- [x] T008 [P] Use-case unit test: `searchProducts` in `tests/unit/features/catalog/use-cases/searchProducts.spec.ts` (valid + error path: missing storeId)
- [x] T009 [P] Use-case unit test: `getProductDetails` in `tests/unit/features/catalog/use-cases/getProductDetails.spec.ts`
- [x] T010 [P] Use-case unit test: `listStores` in `tests/unit/features/catalog/use-cases/listStores.spec.ts`
- [x] T011 [P] Mapper unit test: product DTO→entity in `tests/unit/features/catalog/mappers/productMapper.spec.ts`
- [x] T012 [P] Mapper unit test: store DTO→entity in `tests/unit/features/catalog/mappers/storeMapper.spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

Domain, ports, errors
- [x] T013 [P] Define entities in `src/core/entities/Product.ts`, `src/core/entities/Pricing.ts`, `src/core/entities/Nutrition.ts`, `src/core/entities/Store.ts`
- [x] T014 [P] Define error/result types in `src/core/errors/Errors.ts` (e.g., `{ type, code?, retryable?, message }` and `Result<T>` union)
- [x] T015 Define repository port in `src/core/ports/SupermarketRepository.ts` with: `searchProducts`, `listStores`, `getProductDetails`

Use-cases, DTOs, mappers, repository, datasource
- [x] T016 [P] Implement use-case `searchProducts` in `src/features/catalog/use-cases/searchProducts.ts` (requires storeId, user pagination)
- [x] T017 [P] Implement use-case `listStores` in `src/features/catalog/use-cases/listStores.ts`
- [x] T018 [P] Implement use-case `getProductDetails` in `src/features/catalog/use-cases/getProductDetails.ts`
- [x] T019 Define minimal DTOs in `src/features/catalog/dtos/SearchDTO.ts`, `src/features/catalog/dtos/ProductDTO.ts`, `src/features/catalog/dtos/StoreDTO.ts`
- [x] T020 Implement mappers in `src/features/catalog/mappers/productMapper.ts`, `src/features/catalog/mappers/storeMapper.ts`
- [x] T021 Implement repository in `src/features/catalog/repositories/SuperstoreRepository.ts` (adapts datasource + mappers to port)
- [x] T022 Implement datasource in `src/features/catalog/datasources/SuperstoreApiDatasource.ts` (no embedded keys; accepts config)

## Phase 3.4: Integration

- [x] T023 Wire DI/container in `src/config/container.ts` (construct repository with datasource)
- [x] T024 Provide config schema in `src/config/env.ts` (API key, banner, base URLs)
- [x] T025 Logging adapter in `src/config/logger.ts` (structured, redact sensitive headers)
- [x] T026 Export public API in `src/index.ts` (listStores, searchProducts, getProductDetails)

## Phase 3.5: Polish

- [x] T027 [P] Additional unit tests for mappers/validators in `tests/unit/core/mappers.spec.ts`
- [x] T028 Performance smoke check for search path (log timings) in `tests/unit/features/catalog/perf.spec.ts`
- [x] T029 [P] Update `README.md` with usage examples (configure API key, call flows)
- [x] T030 [P] Add/verify JSDoc for all exported APIs (types and examples)

## Dependencies

- T004–T012 (tests) must be written and fail before T013–T022
- T015 (port) blocks T021–T022
- T016–T018 depend on T015 (port) and entities
- T023–T026 depend on core pieces compiled
- Polish T027–T030 after implementation

## Parallel Example

```
# Launch contract tests together
Task: tests/contract/client-api/searchProducts.contract.spec.ts
Task: tests/contract/client-api/listStores.contract.spec.ts
Task: tests/contract/client-api/getProductDetails.contract.spec.ts

# Launch use-case and mapper unit tests together
Task: tests/unit/features/catalog/use-cases/searchProducts.spec.ts
Task: tests/unit/features/catalog/use-cases/getProductDetails.spec.ts
Task: tests/unit/features/catalog/use-cases/listStores.spec.ts
Task: tests/unit/features/catalog/mappers/productMapper.spec.ts
Task: tests/unit/features/catalog/mappers/storeMapper.spec.ts
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Validation Checklist

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

