import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import MarkdownField from "../src/components/ui/MarkdownField.jsx";

// Test emoji picker accessibility basics

describe("Emoji picker accessibility", () => {
  it("opens and closes with Escape and has listbox role", () => {
    const { getByTitle, getByRole, queryByRole } = render(
      <MarkdownField id="mdemoji" value="" onChange={() => {}} />,
    );
    // Toolbar emoji button uses title="Emoji picker"
    const btn = getByTitle("Emoji picker");
    fireEvent.click(btn);
    const list = getByRole("listbox", { name: /emoji picker/i });
    expect(list).toBeTruthy();
    fireEvent.keyDown(list, { key: "Escape" });
    expect(queryByRole("listbox", { name: /emoji picker/i })).toBeNull();
  });
});
