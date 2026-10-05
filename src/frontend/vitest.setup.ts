import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom does not implement `window.scrollTo`, which the router's scroll
// restoration calls on navigation. Stub it so the suite output stays clean.
vi.stubGlobal("scrollTo", vi.fn());

// React Testing Library does not auto-clean when Vitest globals are disabled,
// so unmount every rendered tree between tests.
afterEach(() => {
  cleanup();
});
