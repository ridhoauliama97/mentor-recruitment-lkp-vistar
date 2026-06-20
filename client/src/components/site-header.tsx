import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import GlobalSearch from "@/components/global-search";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/criteria": "Kriteria Penilaian",
  "/candidates": "Kandidat",
  "/calculation": "Perhitungan PSI",
  "/results": "Hasil Penilaian",
  "/settings": "Pengaturan",
};

export function SiteHeader() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Dashboard";
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-72 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="mr-1.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <span className="hidden flex-1 text-left sm:inline">Search</span>
            <kbd className="inline-flex items-center gap-0.5 rounded border bg-background px-1 font-mono text-[9px] font-medium">
              Ctrl<span>+</span>K
            </kbd>
          </button>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
