import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/provider";
import { CommandPalette } from "./command-palette";
import { EmptyState, LevelBar, StateBadge } from "./ui";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
const wrap = (el: ReactElement, locale: "en" | "fr" | "ar" = "en") => <QueryClientProvider client={new QueryClient()}><I18nProvider locale={locale}>{el}</I18nProvider></QueryClientProvider>;
const render = (el: ReactElement, locale: "en" | "fr" | "ar" = "en") => rtlRender(wrap(el, locale));

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
  it("localises state badges (fr, ar)", () => {
    const fr = render(<StateBadge state="verified" />, "fr");
    expect(fr.container).toHaveTextContent("Vérifié");
    const ar = render(<StateBadge state="verified" />, "ar");
    expect(ar.container).toHaveTextContent("موثّق");
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
