import { Link, useLocation } from "wouter";
import { PenSquare, BarChart3, Sparkles, Download, Activity, Settings, History } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Daily Entry",
    url: "/",
    icon: PenSquare,
    testId: "nav-daily-entry",
  },
  {
    title: "History",
    url: "/history",
    icon: History,
    testId: "nav-history",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    testId: "nav-analytics",
  },
  {
    title: "AI Summary",
    url: "/ai-summary",
    icon: Sparkles,
    testId: "nav-ai-summary",
  },
  {
    title: "Export Data",
    url: "/export",
    icon: Download,
    testId: "nav-export",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    testId: "nav-settings",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">MindTrack</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={item.testId}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
