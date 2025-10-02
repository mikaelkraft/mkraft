import { describe, it, expect } from "vitest";
import {
  parseYouTubeId,
  parseVimeoId,
  parseSpotify,
  buildYouTubeEmbed,
  buildVimeoEmbed,
  buildSpotifyEmbed,
} from "../src/utils/markdownEmbeds";

describe("markdown embed parsers", () => {
  it("parses standard YouTube watch URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });
  it("parses youtu.be short URL", () => {
    expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("parses shorts URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });
  it("returns null for invalid YouTube URL", () => {
    expect(parseYouTubeId("https://example.com/video")).toBeNull();
  });

  it("parses vimeo URL", () => {
    expect(parseVimeoId("https://vimeo.com/123456789")).toBe("123456789");
  });
  it("parses vimeo video/ URL", () => {
    expect(parseVimeoId("https://vimeo.com/video/987654321")).toBe("987654321");
  });
  it("returns null for invalid vimeo URL", () => {
    expect(parseVimeoId("https://vimeo.com/abcd")).toBeNull();
  });

  it("parses spotify track", () => {
    expect(parseSpotify("https://open.spotify.com/track/123abcXYZ")).toEqual({
      type: "track",
      id: "123abcXYZ",
    });
  });
  it("parses spotify playlist", () => {
    expect(parseSpotify("https://open.spotify.com/playlist/PL12345")).toEqual({
      type: "playlist",
      id: "PL12345",
    });
  });
  it("returns null for non-spotify URL", () => {
    expect(parseSpotify("https://example.com/track/123")).toBeNull();
  });

  it("builds YouTube embed iframe", () => {
    const html = buildYouTubeEmbed("abc123");
    expect(html).toContain("youtube.com/embed/abc123");
  });
  it("builds Vimeo embed iframe", () => {
    const html = buildVimeoEmbed("555");
    expect(html).toContain("vimeo.com/video/555");
  });
  it("builds Spotify embed iframe", () => {
    const html = buildSpotifyEmbed("track", "xyz");
    expect(html).toContain("open.spotify.com/embed/track/xyz");
  });
});
