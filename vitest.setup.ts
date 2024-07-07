import "@testing-library/jest-dom";
import { useState } from "react";
import { vi } from "vitest";

export const scrollIntoViewMock = vi.fn();

window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

// mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: "dark",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("react-webgl-trails", () => ({ MouseTrail: () => null }));

vi.mock("react-color-palette", () => ({ ColorPicker: () => null, useColor: useState }));
