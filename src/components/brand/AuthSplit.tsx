import { ReactNode } from "react";
import BrandLogo from "@/components/BrandLogo";

/**
 * Split sign-in layout: the form on one side, a quiet branded panel on the
 * other. The panel is intentionally typographic — no photography.
 */
export default function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-paper">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <aside className="hidden md:flex flex-col items-center justify-center bg-ink px-16 py-24">
        <BrandLogo variant="dark" className="h-16 w-auto" />
        <div className="mt-10 h-px w-12 bg-paper/20" />
      </aside>
    </main>
  );
}
