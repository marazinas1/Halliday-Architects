import { Link, useLocation, useNavigate } from "react-router-dom";
import { FolderOpen, Users, Settings, FileText, Inbox, LogOut, Tags, Home, UserCog, LayoutDashboard, Quote, BarChart3, ArrowLeft } from "lucide-react";
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

const ITEMS: Item[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, access: "staff", match: (p) => p === "/admin" },
  { title: "Projects", url: "/admin/projects", icon: FolderOpen, access: "staff", match: (p) => p.startsWith("/admin/projects") },
  { title: "Tags", url: "/admin/tags", icon: Tags, access: "staff", match: (p) => p.startsWith("/admin/tags") },
  { title: "Team", url: "/admin/team", icon: Users, access: "owner", match: (p) => p.startsWith("/admin/team") },
  {
    title: "Testimonials",
    url: "/admin/testimonials",
    icon: Quote,
    access: "owner",
    match: (p) => p.startsWith("/admin/testimonials"),
  },
  { title: "Blog", url: "/admin/blog", icon: FileText, access: "staff", match: (p) => p.startsWith("/admin/blog") },
  { title: "Inquiries", url: "/admin/inquiries", icon: Inbox, access: "owner", match: (p) => p.startsWith("/admin/inquiries") },
  { title: "Homepage", url: "/admin/homepage", icon: Home, access: "owner", match: (p) => p.startsWith("/admin/homepage") },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
    access: "owner",
    match: (p) => p.startsWith("/admin/analytics"),
  },
  { title: "Users", url: "/admin/users", icon: UserCog, access: "owner", match: (p) => p.startsWith("/admin/users") },
  { title: "Settings", url: "/admin/settings", icon: Settings, access: "owner", match: (p) => p.startsWith("/admin/settings") },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  platform_owner: "Developer",
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
      <SidebarHeader className="border-b border-line">
        <Link to="/admin" className="flex items-center h-12 px-2">
          <BrandLogo className={collapsed ? "h-6 w-auto" : "h-8 w-auto"} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((item) => {
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
                        to={item.url}
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
      </SidebarContent>

      <SidebarFooter className="border-t border-line">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`px-2 py-1 ${collapsed ? "hidden" : ""}`}>
              <div className="text-xs text-stone truncate">{email}</div>
              <div className="text-[11px] uppercase tracking-wider text-stone/70">
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
