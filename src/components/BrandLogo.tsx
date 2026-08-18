import { useSiteSettings } from "@/hooks/useSiteSettings";

type Props = {
  /** "light" = logo sits on a light surface; "dark" = on ink or imagery. */
  variant?: "light" | "dark";
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The firm's mark, read from site_settings so it can be replaced in the admin
 * without touching code. Falls back to the bundled logo when nothing is set.
 */
const BrandLogo = ({ variant = "light", className, style }: Props) => {
  const { settings } = useSiteSettings();
  const useDark = variant === "dark" && settings.logoDarkUrl;
  const src = useDark ? (settings.logoDarkUrl as string) : settings.logoUrl;

  // Without a dedicated dark variant, knock the light mark out to white.
  const needsInvert = variant === "dark" && !settings.logoDarkUrl;
  const filter = [needsInvert ? "brightness(0) invert(1)" : null, style?.filter]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={src}
      alt={settings.siteName}
      className={className}
      style={{ ...style, filter: filter || undefined }}
    />
  );
};

export default BrandLogo;
