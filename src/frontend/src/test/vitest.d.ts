// Registers the jest-dom matcher types (toBeInTheDocument, toHaveAttribute, …)
// on Vitest's `Assertion` interface for the app's TypeScript project.
//
// The runtime setup lives in `vitest.setup.ts` at the frontend root, which is
// outside tsconfig's `include: ["src"]`, so its `import` never reaches `tsc`.
// This declaration sits under `src/` so the augmentation is always loaded and
// `pnpm typecheck` sees the matchers the tests use.
import "@testing-library/jest-dom/vitest";
