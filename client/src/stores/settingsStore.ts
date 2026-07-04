import { create } from "zustand";
import { toast } from "sonner";
import type { AppSettings } from "@/types";
import { api } from "@/lib/api";

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  saving: boolean;
  fetch: () => Promise<void>;
  save: (data: AppSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  loading: false,
  saving: false,
  fetch: async () => {
    set({ loading: true });
    try {
      const settings = await api.get<AppSettings>("/settings");
      set({ settings, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  save: async (data) => {
    set({ saving: true });
    try {
      await api.put("/settings", {
        app_name: data.app_name,
        institution: data.institution,
        logo: (data as AppSettings & { logo?: string }).logo,
        gemini_api_key: (data as AppSettings & { gemini_api_key?: string }).gemini_api_key,
      });
      set({ settings: data, saving: false });
      toast.success("Pengaturan berhasil disimpan");
    } catch (err) {
      set({ saving: false });
      toast.error(`Gagal menyimpan pengaturan: ${(err as Error).message}`);
    }
  },
}));
