import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./command-palette";
import { EmptyState, LevelBar, StateBadge } from "./ui";

describe("ui", () => {
  it("labels provisional vs verified skill state distinctly", () => {
    render(<><StateBadge state="provisional" /><StateBadge state="verified" /></>);
    expect(screen.getByText("Provisional")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });
  it("exposes level to assistive tech", () => {
    render(<LevelBar level={3} />);
    expect(screen.getByRole("img", { name: "Level 3 of 5" })).toBeInTheDocument();
  });
  it("renders empty state", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});

describe("command palette", () => {
  it("filters and runs a command with the keyboard", () => {
    const run = vi.fn(), close = vi.fn();
    render(<CommandPalette open onClose={close} commands={[{ label: "Go to Skills", run }, { label: "Sign out", run: vi.fn() }]} />);
    const box = screen.getByRole("combobox");
    fireEvent.change(box, { target: { value: "skills" } });
    expect(screen.queryByText("Sign out")).toBeNull();
    fireEvent.keyDown(box, { key: "Enter" });
    expect(run).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });
  it("renders nothing when closed", () => {
    const { container } = render(<CommandPalette open={false} onClose={() => {}} commands={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
