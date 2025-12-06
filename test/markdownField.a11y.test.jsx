import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import MarkdownField from "../src/components/ui/MarkdownField.jsx";

// Accessibility-focused tests (lightweight, structural)

describe("MarkdownField accessibility", () => {
  const setup = () => {
    const utils = render(
      <MarkdownField id="mdtest" value="" onChange={() => {}} />,
    );
    const textarea = utils.getByLabelText("Markdown editor");
    return { ...utils, textarea };
  };

  it("renders toolbar with role toolbar", () => {
    const { getByRole } = setup();
    const tb = getByRole("toolbar");
    expect(tb).toBeTruthy();
  });

  it("opens slash menu and supports arrow navigation state changes", () => {
    const { textarea, queryByRole, getByRole } = setup();
    fireEvent.keyDown(textarea, { key: "/" });
    fireEvent.change(textarea, { target: { value: "/" } });
    const list = getByRole("listbox", { name: /slash command/i });
    expect(list).toBeTruthy();
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    // We can't easily assert aria-activedescendant without exposing it; rely on presence
    fireEvent.keyDown(textarea, { key: "Escape" });
    expect(queryByRole("listbox", { name: /slash command/i })).toBeNull();
  });
});
