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
  it("prefers override image over settings fallback and sets canonical/url/type", async () => {
    const testUrl = "https://example.com/blog/post-123";
    render(
      <HelmetProvider>
        <OGMeta
          title="Example"
          description="Desc"
          image="https://cdn.example.com/post-specific.jpg"
          url={testUrl}
          type="article"
        />
      </HelmetProvider>,
    );
    await waitFor(() => {
      const ogImage = document.head.querySelector('meta[property="og:image"]');
      const ogUrl = document.head.querySelector('meta[property="og:url"]');
      const ogType = document.head.querySelector('meta[property="og:type"]');
      const canonical = document.head.querySelector('link[rel="canonical"]');
      expect(ogImage).not.toBeNull();
      expect(ogImage.getAttribute("content")).toBe(
        "https://cdn.example.com/post-specific.jpg",
      );
      expect(ogUrl?.getAttribute("content")).toBe(testUrl);
      expect(ogType?.getAttribute("content")).toBe("article");
      expect(canonical?.getAttribute("href")).toBe(testUrl);
    });
  });
});
