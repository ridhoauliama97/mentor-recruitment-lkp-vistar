import { create } from "zustand";
import { toast } from "sonner";
import type { Candidate } from "@/types";
import { api } from "@/lib/api";

interface CandidateState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (data: Partial<Candidate>) => Promise<void>;
  update: (id: number, data: Partial<Candidate>) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidates: [],
  loading: false,
  error: null,
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const candidates = await api.get<Candidate[]>("/candidates");
      set({ candidates, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
  create: async (data) => {
    set({ error: null });
    try {
      await api.post("/candidates", data);
      const candidates = await api.get<Candidate[]>("/candidates");
      set({ candidates });
      toast.success("Kandidat berhasil ditambahkan");
    } catch (err) {
      const msg = (err as Error).message;
      set({ error: msg });
      toast.error(`Gagal menambah kandidat: ${msg}`);
      throw err;
    }
  },
  update: async (id, data) => {
    set({ error: null });
    try {
      await api.put(`/candidates/${id}`, data);
      const candidates = await api.get<Candidate[]>("/candidates");
      set({ candidates });
      toast.success("Kandidat berhasil diperbarui");
    } catch (err) {
      const msg = (err as Error).message;
      set({ error: msg });
      toast.error(`Gagal memperbarui kandidat: ${msg}`);
      throw err;
    }
  },
  remove: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/candidates/${id}`);
      const candidates = await api.get<Candidate[]>("/candidates");
      set({ candidates });
      toast.success("Kandidat berhasil dihapus");
    } catch (err) {
      const msg = (err as Error).message;
      set({ error: msg });
      toast.error(`Gagal menghapus kandidat: ${msg}`);
      throw err;
    }
  },
}));
