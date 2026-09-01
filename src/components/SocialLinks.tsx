import { Instagram } from "lucide-react";
import { SOCIAL_LINKS } from "@/content/firm";

const SocialLinks = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    {SOCIAL_LINKS.map((social) => {
      return (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center text-paper/60 transition-colors duration-300 ease-out hover:text-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper/70"
          aria-label={social.name}
        >
          <Instagram size={54} />
        </a>
      );
    })}
  </div>
);

export default SocialLinks;
