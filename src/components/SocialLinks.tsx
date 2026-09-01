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
          className="w-10 h-10 flex items-center justify-center text-paper/60 hover:text-paper hover:bg-paper/25 hover:scale-110 hover:brightness-125 transition-all duration-300 ease-out"
          style={{ borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.1)" }}
          aria-label={social.name}
        >
          <Instagram size={18} />
        </a>
      );
    })}
  </div>
);

export default SocialLinks;
