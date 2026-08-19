import { Instagram } from "lucide-react";
import { SOCIAL_LINKS } from "@/content/firm";

// Custom Houzz icon (lucide has no Houzz glyph)
const HouzzIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M5 1.5v6.4l9 2.6v3.1l5-1.4V22h-6.5v-5.4h-5V22H5z" />
  </svg>
);

const ICONS: Record<string, (props: { size?: number }) => JSX.Element> = {
  Instagram: ({ size = 18 }) => <Instagram size={size} />,
  Houzz: HouzzIcon,
};

const SocialLinks = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    {SOCIAL_LINKS.map((social) => {
      const Icon = ICONS[social.name];
      return (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center text-paper/60 hover:text-paper hover:bg-paper/25 hover:scale-110 hover:brightness-125 transition-all duration-300 ease-out"
          style={{ borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.1)" }}
          aria-label={social.name}
        >
          <Icon size={18} />
        </a>
      );
    })}
  </div>
);

export default SocialLinks;
