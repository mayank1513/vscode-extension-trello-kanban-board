import "@testing-library/jest-dom";
import { vi } from "vitest";

export const scrollIntoViewMock = vi.fn();

window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
