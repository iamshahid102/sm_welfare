import { cn } from "@/lib/utils";
import { SITE, SOCIAL_LINKS, type SocialPlatform } from "@/constants/site";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";

/**
 * Brand icons come from react-icons (Font Awesome 6 brands) because the
 * Heroicons set intentionally does not ship official brand logos. Each icon
 * inherits currentColor.
 */
const ICONS: Record<SocialPlatform, React.ComponentType<{ size?: number }>> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  tiktok: FaTiktok,
  youtube: FaYoutube,
};

interface SocialLinksProps {
  className?: string;
  /** Icon size in px — brand glyphs are square. */
  size?: number;
  /** Light variant (white icons) for dark/blue backgrounds. */
  light?: boolean;
}

/** Row of social profile links with accessible labels. */
export function SocialLinks({ className, size = 16, light }: SocialLinksProps) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {SOCIAL_LINKS.map(({ platform, label, href }) => {
        const Icon = ICONS[platform];
        return (
          <li key={platform}>
            <a
              href={href}
              aria-label={`${SITE.name} on ${label}`}
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                light
                  ? "text-blue-100 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={size} aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}