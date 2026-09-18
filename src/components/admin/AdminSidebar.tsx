import { Link, useLocation, useNavigate } from "@/lib/router-compat";
import { FolderOpen, Settings, FileText, Inbox, LogOut, UserCog, LayoutDashboard, BarChart3, ArrowLeft, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BrandLogo from "@/components/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { useUnreadInquiryCount } from "@/hooks/admin/useInquiries";
import { canAccess, isOwnerRole, type AdminAccess, type AdminRole } from "@/hooks/admin/useAdminAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = {
  title: string;
  url: string;
  icon: typeof FolderOpen;
  access: AdminAccess;
  match: (p: string) => boolean;
};

type Group = { label: string; items: Item[] };

/**
 * Grouped so the panel reads like the site itself: the day-to-day workspace
 * first, then a page-by-page mirror of the public site, then configuration.
 */
const SETTINGS_PATHS = [
  "/admin/settings",
  "/admin/home",
  "/admin/about",
  "/admin/team",
  "/admin/services",
  "/admin/contact",
  "/admin/photographs",
];

const GROUPS: Group[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, access: "staff", match: (p) => p === "/admin" },
      { title: "Inquiries", url: "/admin/inquiries", icon: Inbox, access: "owner", match: (p) => p.startsWith("/admin/inquiries") },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3, access: "owner", match: (p) => p.startsWith("/admin/analytics") },
    ],
  },
  {
    label: "Manage",
    items: [
      {
        title: "Projects",
        url: "/admin/projects",
        icon: FolderOpen,
        access: "staff",
        match: (p) => p.startsWith("/admin/projects") || p.startsWith("/admin/tags"),
      },
      { title: "Articles", url: "/admin/blog", icon: FileText, access: "staff", match: (p) => p.startsWith("/admin/blog") },
      {
        title: "Testimonials",
        url: "/admin/testimonials",
        icon: Quote,
        access: "staff",
        match: (p) => p.startsWith("/admin/testimonials"),
      },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Users", url: "/admin/users", icon: UserCog, access: "owner", match: (p) => p.startsWith("/admin/users") },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
        access: "staff",
        match: (p) => SETTINGS_PATHS.some((path) => p.startsWith(path)),
      },
    ],
  },
];


const ROLE_LABEL: Record<AdminRole, string> = {
  developer: "Developer",
  owner: "Owner",
  editor: "Editor",
};

export default function AdminSidebar({ email, role }: { email: string; role: AdminRole }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const owner = isOwnerRole(role);
  const { data: unreadCount = 0 } = useUnreadInquiryCount(owner);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <Link to="/admin" className="flex items-center h-12 px-2">
          <BrandLogo className={collapsed ? "h-6 w-auto" : "h-8 w-auto"} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const allowed = canAccess(role, item.access);

                  if (!allowed) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <SidebarMenuButton
                                disabled
                                aria-disabled="true"
                                className="opacity-40 cursor-not-allowed"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </SidebarMenuButton>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            Only owners can manage {item.title.toLowerCase()}
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.match(pathname)} tooltip={item.title}>
                        <Link
                          to={item.title === "Settings" && !owner ? "/admin/home" : item.url}
                          className="flex items-center gap-2"
                          onClick={() => {
                            if (isMobile) setOpenMobile(false);
                          }}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.title === "Inquiries" && unreadCount > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center px-1.5 text-[11px]">
                              {unreadCount}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`px-2 py-1 ${collapsed ? "hidden" : ""}`}>
              <div className="text-xs text-muted-foreground truncate">{email}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                {ROLE_LABEL[role]}
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to site">
              <Link
                to="/"
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sign out">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
