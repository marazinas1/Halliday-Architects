import { Link, useLocation, useNavigate } from "react-router-dom";
import { FolderOpen, Users, Settings, FileText, Inbox, LogOut, Tags, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BrandLogo from "@/components/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { useUnreadInquiryCount } from "@/hooks/admin/useInquiries";
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

const ITEMS = [
  { title: "Projects", url: "/admin", icon: FolderOpen, match: (p: string) => p === "/admin" || p.startsWith("/admin/projects") },
  { title: "Tags", url: "/admin/tags", icon: Tags, match: (p: string) => p.startsWith("/admin/tags") },
  { title: "Team", url: "/admin/team", icon: Users, match: (p: string) => p.startsWith("/admin/team") },
  { title: "Blog", url: "/admin/blog", icon: FileText, match: (p: string) => p.startsWith("/admin/blog") },
  { title: "Inquiries", url: "/admin/inquiries", icon: Inbox, match: (p: string) => p.startsWith("/admin/inquiries") },
  { title: "Homepage", url: "/admin/homepage", icon: Home, match: (p: string) => p.startsWith("/admin/homepage") },
  { title: "Settings", url: "/admin/settings", icon: Settings, match: (p: string) => p.startsWith("/admin/settings") },
];

export default function AdminSidebar({ email }: { email: string }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { data: unreadCount = 0 } = useUnreadInquiryCount();

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
              {ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.match(pathname)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-line">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`px-2 py-1 text-xs text-stone truncate ${collapsed ? "hidden" : ""}`}>{email}</div>
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
