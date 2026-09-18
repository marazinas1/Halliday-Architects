import type { ReactNode } from "react";

/**
 * Standard admin page header: title and one explaining sentence on the left,
 * at most one primary action on the right. Unframed, full width.
 */
export default function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="grid w-full gap-2 [&>*]:w-full sm:flex sm:w-auto sm:shrink-0 sm:items-center sm:[&>*]:w-auto">{action}</div>}
    </header>
  );
}
