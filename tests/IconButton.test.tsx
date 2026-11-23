// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@heroui/react", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Button: ({
    children,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    "aria-label": string;
  }) => <button aria-label={ariaLabel}>{children}</button>,
}));

vi.mock("@iconify/react", () => ({
  Icon: () => <span aria-hidden="true" />,
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

import IconButton from "@/components/ui/button/IconButton";

describe("IconButton", () => {
  it("uses tooltip text as an accessible label", () => {
    render(<IconButton icon="test-icon" tooltip="Back to top" />);
    expect(screen.getByRole("button", { name: "Back to top" })).toBeTruthy();
  });

  it("prefers an explicit accessible label", () => {
    render(<IconButton icon="test-icon" tooltip="Icon" aria-label="Close dialog" />);
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeTruthy();
  });
});
