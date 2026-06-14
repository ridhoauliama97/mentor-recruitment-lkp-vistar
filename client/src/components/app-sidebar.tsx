import {
  BarChart3,
  GraduationCap,
  ListChecks,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect } from "react";

const navItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Kriteria", url: "/criteria", icon: ListChecks },
  { title: "Kandidat", url: "/candidates", icon: Users },
  { title: "Perhitungan", url: "/calculation", icon: SlidersHorizontal },
  { title: "Hasil", url: "/results", icon: GraduationCap },
  { title: "Pengaturan", url: "/settings", icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, fetch: fetchSettings } = useSettingsStore();
  const { user, logout } = useAuthStore();
  const appName = settings.app_name ?? "Coach PSI";

  useEffect(() => {
    if (!settings.app_name) fetchSettings();
  }, [settings.app_name, fetchSettings]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              onClick={() => navigate("/")}
            >
              <span className="text-base font-semibold">{appName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navItems.map((item) => ({
            ...item,
            isActive: isActive(item.url),
            onClick: () => navigate(item.url),
          }))}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.username ?? "Admin",
            email: "Administrator",
            avatar: "",
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
