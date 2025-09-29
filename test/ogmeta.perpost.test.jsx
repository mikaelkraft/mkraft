import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

// Mock settingsService to control returned settings and avoid network
vi.mock("../src/utils/settingsService.js", () => ({
  default: {
    getSettings: async () => ({
      success: true,
      data: {
        site_title: "SiteTitle",
        site_description: "Desc",
        og_default_image_url: "/assets/images/mkraft.png",
        logo_url: "/assets/images/mklogo.png",
      },
    }),
  },
}));

describe("OGMeta per-post override", () => {
  it("prefers override image over settings fallback", async () => {
    const { container } = render(
      <HelmetProvider>
        <OGMeta
          title="Example"
          description="Desc"
          image="https://cdn.example.com/post-specific.jpg"
        />
      </HelmetProvider>,
    );
    await waitFor(() => {
      const ogImage = document.head.querySelector('meta[property="og:image"]');
      expect(ogImage).not.toBeNull();
      expect(ogImage.getAttribute("content")).toBe(
        "https://cdn.example.com/post-specific.jpg",
      );
    });
  });
});
