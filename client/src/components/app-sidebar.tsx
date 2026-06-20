import {
  BarChart3,
  GaugeIcon,
  ListChecks,
  Settings,
  TrophyIcon,
  Users,
  FolderIcon,
} from "@/components/ui/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { useCriteriaStore } from "@/stores/criteriaStore";
import { useCandidateStore } from "@/stores/candidateStore";
import { usePSIStore } from "@/stores/psiStore";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
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
  { title: "Proses PSI", url: "/calculation", icon: GaugeIcon },
  { title: "Hasil Perhitungan", url: "/results", icon: TrophyIcon },
  { title: "Pengaturan", url: "/settings", icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, fetch: fetchSettings } = useSettingsStore();
  const { user, logout } = useAuthStore();
  const { criteria, fetch: fetchCriteria } = useCriteriaStore();
  const { candidates, fetch: fetchCandidates } = useCandidateStore();
  const { sessions, fetchSessions } = usePSIStore();
  const appName = settings.app_name ?? "Coach PSI";

  useEffect(() => {
    if (!settings.app_name) fetchSettings();
    fetchCriteria();
    fetchCandidates();
    fetchSessions();
  }, [settings.app_name, fetchSettings, fetchCriteria, fetchCandidates, fetchSessions]);

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
            badgeCount: item.url === "/criteria"
              ? criteria.length
              : item.url === "/candidates"
                ? candidates.length
                : item.url === "/results"
                  ? sessions.length
                  : undefined,
          }))}
        />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Dokumentasi"
              onClick={() => window.open("/dokumentasi", "_blank")}
            >
              <FolderIcon />
              <span>Dokumentasi</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator className="my-2" />
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
