// Embed parsing helper functions extracted from MarkdownToolbar for reuse & testing.

export function parseYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const idx = parts.findIndex((p) => p === "embed" || p === "shorts");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  } catch {}
  return null;
}

export function parseVimeoId(url) {
  if (!url) return null;
  try {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    return match ? match[1] : null;
  } catch {}
  return null;
}

export function parseSpotify(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return { type: parts[0], id: parts[1] };
  } catch {}
  return null;
}

export function buildYouTubeEmbed(id) {
  return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}

export function buildVimeoEmbed(id) {
  return `<iframe src="https://player.vimeo.com/video/${id}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
}

export function buildSpotifyEmbed(type, id) {
  return `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/${type}/${id}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
}
