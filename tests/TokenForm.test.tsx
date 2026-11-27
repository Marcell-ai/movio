// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@heroui/react", () => ({
  Button: ({
    children,
    isDisabled,
    onPress,
    type = "button",
  }: {
    children: React.ReactNode;
    isDisabled?: boolean;
    onPress?: () => void;
    type?: "button" | "submit";
  }) => (
    <button type={type} disabled={isDisabled} onClick={onPress}>
      {children}
    </button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Input: ({
    endContent,
    label,
    onValueChange,
    type,
    value,
  }: {
    endContent: React.ReactNode;
    label: string;
    onValueChange: (value: string) => void;
    type: string;
    value: string;
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        type={type}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {endContent}
    </label>
  ),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/ui/other/BrandLogo", () => ({ default: () => null }));
vi.mock("@/components/ui/button/IconButton", () => ({
  default: ({
    "aria-label": ariaLabel,
    onPress,
    type,
  }: {
    "aria-label": string;
    onPress: () => void;
    type: "button" | "submit";
  }) => (
    <button type={type} aria-label={ariaLabel} onClick={onPress}>
      toggle
    </button>
  ),
}));
vi.mock("@/utils/icons", () => ({
  Eye: () => null,
  EyeOff: () => null,
}));

import TokenForm from "@/components/sections/Setup/TokenForm";

describe("TokenForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("reveals and hides the token without submitting the form", () => {
    render(<TokenForm hasToken={false} next="/" />);

    const input = screen.getByLabelText("API Read Access Token");
    fireEvent.change(input, { target: { value: "eyJ.test.token" } });
    expect(input.getAttribute("type")).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: "Show token" }));
    expect(input.getAttribute("type")).toBe("text");
    expect(fetch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Hide token" }));
    expect(input.getAttribute("type")).toBe("password");
    expect(fetch).not.toHaveBeenCalled();
  });
});
