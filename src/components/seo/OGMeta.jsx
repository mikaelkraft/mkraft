import { useEffect, useState } from "react";
// used in returned JSX
import settingsService from "../../utils/settingsService";

// Basic OG meta injector; can be extended per-page with props later.
export default function OGMeta({
  title: overrideTitle,
  description: overrideDescription,
  image: overrideImage,
  url: overrideUrl,
  type = "website",
  canonical,
}) {
  const [meta, setMeta] = useState({});
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await settingsService.getSettings();
      if (!mounted || !res.success) return;
      const s = res.data || {};
      const currentUrl =
        overrideUrl ||
        (typeof window !== "undefined" ? window.location.href : undefined);
      const canonicalUrl = canonical || currentUrl?.split("#")[0];
      setMeta({
        title: overrideTitle || s.site_title || "Site",
        description: overrideDescription || s.site_description || "",
        // Fallback chain: explicit override -> configured OG default -> configured logo -> static mkraft asset
        image:
          overrideImage ||
          s.og_default_image_url ||
          s.logo_url ||
          "/assets/images/mkraft.png",
        url: currentUrl,
        canonical: canonicalUrl,
        type,
      });
    })();
    return () => {
      mounted = false;
    };
  }, [
    overrideTitle,
    overrideDescription,
    overrideImage,
    overrideUrl,
    type,
    canonical,
  ]);
  if (!meta.title) return null;
  return (
    <Helmet>
      <meta property="og:title" content={meta.title} />
      {meta.description && (
        <meta property="og:description" content={meta.description} />
      )}
      {meta.image && <meta property="og:image" content={meta.image} />}
      {meta.url && <meta property="og:url" content={meta.url} />}
      {meta.type && <meta property="og:type" content={meta.type} />}
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      {meta.description && (
        <meta name="twitter:description" content={meta.description} />
      )}
      {meta.image && <meta name="twitter:image" content={meta.image} />}
      {meta.url && <meta name="twitter:url" content={meta.url} />}
    </Helmet>
  );
}
