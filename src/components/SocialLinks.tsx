import { Instagram } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const SocialLinks = ({ className = "" }: { className?: string }) => {
  const { settings } = useSiteSettings();
  const url = settings.contact.instagramUrl;
  if (!url) return null;
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center text-paper/60 transition-colors duration-300 ease-out hover:text-paper focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-paper/70"
        aria-label="Instagram"
      >
        <Instagram size={30} />
      </a>
    </div>
  );
};

export default SocialLinks;
