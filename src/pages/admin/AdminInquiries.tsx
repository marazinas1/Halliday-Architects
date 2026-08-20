import { useEffect, useMemo, useState } from "react";
import { Archive, ArchiveRestore, Mail, Phone, Search, MailOpen } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  useInquiries,
  useUpdateInquiry,
  type Inquiry,
  type InquiryFilter,
} from "@/hooks/admin/useInquiries";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/** Quiet line telling the admin whether the email notification actually went out. */
function NotificationStatus({ inquiry }: { inquiry: Inquiry }) {
  if (inquiry.notify_error) {
    return (
      <p className="text-xs text-destructive">
        Notification failed — {inquiry.notify_error}
      </p>
    );
  }
  if (inquiry.notified_at) {
    return <p className="text-xs text-stone">Notification sent {formatDate(inquiry.notified_at)}</p>;
  }
  return <p className="text-xs text-stone">Notification not sent</p>;
}

function InquiryDetail({
  inquiry,
  onClose,
  onToggleRead,
  onToggleArchive,
}: {
  inquiry: Inquiry | null;
  onClose: () => void;
  onToggleRead: (i: Inquiry) => void;
  onToggleArchive: (i: Inquiry) => void;
}) {
  return (
    <Sheet open={Boolean(inquiry)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {inquiry && (
          <>
            <SheetHeader className="text-left">
              <SheetTitle className="text-xl">{inquiry.name}</SheetTitle>
              <p className="text-xs text-stone">{formatDate(inquiry.created_at)}</p>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-2">
                <a
                  href={`mailto:${inquiry.email}?subject=${encodeURIComponent("Re: Your inquiry to Halliday Architects")}`}
                  className="inline-flex items-center gap-2 text-sm text-ink underline underline-offset-4"
                >
                  <Mail className="h-4 w-4" />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <a
                    href={`tel:${inquiry.phone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-2 text-sm text-ink underline underline-offset-4"
                  >
                    <Phone className="h-4 w-4" />
                    {inquiry.phone}
                  </a>
                )}
              </div>

              <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
                {(inquiry.project_type || inquiry.interest) && (
                  <>
                    <dt className="text-stone">Project type</dt>
                    <dd className="text-ink">{inquiry.project_type ?? inquiry.interest}</dd>
                  </>
                )}
                {inquiry.timeline && (
                  <>
                    <dt className="text-stone">Timeline</dt>
                    <dd className="text-ink">{inquiry.timeline}</dd>
                  </>
                )}
                {inquiry.source && (
                  <>
                    <dt className="text-stone">Source</dt>
                    <dd className="text-ink">{inquiry.source}</dd>
                  </>
                )}
              </dl>

              {inquiry.message && (
                <div className="rounded border border-line bg-sand p-4">
                  <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                    {inquiry.message}
                  </p>
                </div>
              )}

              <NotificationStatus inquiry={inquiry} />

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => onToggleRead(inquiry)}>
                  <MailOpen className="h-4 w-4" />
                  {inquiry.read_at ? "Mark as unread" : "Mark as read"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => onToggleArchive(inquiry)}>
                  {inquiry.archived_at ? (
                    <>
                      <ArchiveRestore className="h-4 w-4" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      Archive
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InquiriesBody() {
  const [filter, setFilter] = useState<InquiryFilter>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: inquiries, isLoading } = useInquiries(filter, search);
  const update = useUpdateInquiry();
  const { toast } = useToast();

  const selected = useMemo(
    () => inquiries?.find((i) => i.id === openId) ?? null,
    [inquiries, openId],
  );

  // Opening an enquiry marks it read.
  useEffect(() => {
    if (selected && !selected.read_at) {
      update.mutate({ id: selected.id, patch: { read_at: new Date().toISOString() } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const toggleRead = (inquiry: Inquiry) =>
    update.mutate({
      id: inquiry.id,
      patch: { read_at: inquiry.read_at ? null : new Date().toISOString() },
    });

  const toggleArchive = (inquiry: Inquiry) => {
    const archiving = !inquiry.archived_at;
    update.mutate(
      { id: inquiry.id, patch: { archived_at: archiving ? new Date().toISOString() : null } },
      {
        onSuccess: () => {
          setOpenId(null);
          toast({
            title: archiving ? "Archived" : "Restored",
            description: archiving
              ? "Hidden from the list. Nothing was deleted — find it under Archived."
              : "Back in the inbox.",
          });
        },
      },
    );
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl text-ink mb-1">Inquiries</h1>
      <p className="text-sm text-stone mb-6">
        Everything submitted through the contact form. Archiving hides an enquiry — it is never deleted.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as InquiryFilter)}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-stone">Loading…</p>
      ) : !inquiries || inquiries.length === 0 ? (
        <div className="border border-line rounded bg-card p-10 text-center">
          <p className="text-sm text-stone">
            {filter === "archived" ? "Nothing archived." : "No inquiries yet."}
          </p>
        </div>
      ) : (
        <div className="border border-line rounded bg-card divide-y divide-line overflow-hidden">
          {inquiries.map((inquiry) => {
            const unread = !inquiry.read_at;
            return (
              <button
                key={inquiry.id}
                type="button"
                onClick={() => setOpenId(inquiry.id)}
                className={`w-full text-left px-4 py-4 hover:bg-sand transition-colors ${unread ? "bg-sand/60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={`mt-2 h-2 w-2 rounded-full shrink-0 ${unread ? "bg-ink" : "bg-transparent"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`truncate ${unread ? "font-semibold text-ink" : "text-ink"}`}>
                        {inquiry.name}
                      </span>
                      {unread && <Badge variant="secondary">New</Badge>}
                      {inquiry.archived_at && <Badge variant="outline">Archived</Badge>}
                      {inquiry.notify_error && (
                        <Badge variant="destructive">Notification failed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-stone truncate">
                      {inquiry.email}
                      {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                    </p>
                    <p className="text-xs text-stone mt-1">
                      {[inquiry.project_type ?? inquiry.interest, inquiry.timeline]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <span className="text-xs text-stone shrink-0 whitespace-nowrap">
                    {formatDate(inquiry.created_at)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <InquiryDetail
        inquiry={selected}
        onClose={() => setOpenId(null)}
        onToggleRead={toggleRead}
        onToggleArchive={toggleArchive}
      />
    </div>
  );
}

export default function AdminInquiries() {
  return (
    <AdminProtected access="owner">
      <InquiriesBody />
    </AdminProtected>
  );
}