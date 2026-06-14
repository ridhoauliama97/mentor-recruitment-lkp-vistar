import { create } from "zustand";
import { toast } from "sonner";
import type { PSIResult } from "@/types";
import { api } from "@/lib/api";

interface PSIState {
  sessions: PSIResult[];
  currentResult: PSIResult | null;
  loading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  fetchSession: (id: number) => Promise<void>;
  calculate: (config: {
    sessionName: string;
    description: string;
    candidateIds: number[];
    criteriaIds: number[];
  }) => Promise<PSIResult>;
  removeSession: (id: number) => Promise<void>;
}

export const usePSIStore = create<PSIState>((set) => ({
  sessions: [],
  currentResult: null,
  loading: false,
  error: null,
  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await api.get<PSIResult[]>("/psi/sessions");
      set({ sessions, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
  fetchSession: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await api.get<PSIResult>(`/psi/sessions/${id}`);
      set({ currentResult: result, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
  calculate: async (config) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<PSIResult>("/psi/calculate", config);
      set({ currentResult: result, loading: false });
      toast.success("Perhitungan PSI selesai");
      return result;
    } catch (err) {
      const msg = (err as Error).message;
      set({ error: msg, loading: false });
      toast.error(`Gagal menghitung PSI: ${msg}`);
      throw err;
    }
  },
  removeSession: async (id) => {
    try {
      await api.delete(`/psi/sessions/${id}`);
      const sessions = await api.get<PSIResult[]>("/psi/sessions");
      set({ sessions });
      toast.success("Sesi perhitungan berhasil dihapus");
    } catch (err) {
      toast.error(`Gagal menghapus sesi: ${(err as Error).message}`);
      throw err;
    }
  },
}));
