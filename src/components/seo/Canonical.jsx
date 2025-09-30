import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl } from "../../utils/canonical";

// Canonical tag injector. Place once near root so every route updates tag.
export default function Canonical({ path, suppress, url }) {
  const location = useLocation();
  const legacySuppress =
    typeof window !== "undefined" && window.__SUPPRESS_CANONICAL;
  const isSuppressed = !!(suppress || legacySuppress);
  if (isSuppressed) return null;
  const effectivePath = path || location.pathname + location.search;
  const canonical = getCanonicalUrl(url || effectivePath);
  return (
    <Helmet>
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}
