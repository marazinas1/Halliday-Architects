import { ReactNode } from "react";

export default function AuthCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-10">
        {eyebrow && (
          <p className="text-xs tracking-[0.3em] uppercase text-stone mb-4">{eyebrow}</p>
        )}
        <h1 className="text-3xl text-ink">{title}</h1>
        <div className="mt-6 h-px w-12 bg-ink/20" />
      </div>
      <div className="bg-card border border-line rounded-sm p-8">{children}</div>
    </div>
  );
}
