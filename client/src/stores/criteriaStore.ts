import { create } from "zustand";
import { toast } from "sonner";
import type { Criteria, SubCriteria } from "@/types";
import { api } from "@/lib/api";

interface CriteriaState {
  criteria: Criteria[];
  subCriteria: Record<number, SubCriteria[]>;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (data: Partial<Criteria>) => Promise<void>;
  update: (id: number, data: Partial<Criteria>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  fetchSubCriteria: (criteriaId: number) => Promise<void>;
  createSubCriteria: (criteriaId: number, data: Partial<SubCriteria>) => Promise<void>;
  updateSubCriteria: (id: number, data: Partial<SubCriteria>) => Promise<void>;
  removeSubCriteria: (id: number, criteriaId: number) => Promise<void>;
}

export const useCriteriaStore = create<CriteriaState>((set) => ({
  criteria: [],
  subCriteria: {},
  loading: false,
  error: null,
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const criteria = await api.get<Criteria[]>("/criteria");
      set({ criteria, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
  create: async (data) => {
    try {
      await api.post("/criteria", data);
      const criteria = await api.get<Criteria[]>("/criteria");
      set({ criteria });
      toast.success("Kriteria berhasil ditambahkan");
    } catch (err) {
      toast.error(`Gagal menambah kriteria: ${(err as Error).message}`);
      throw err;
    }
  },
  update: async (id, data) => {
    try {
      await api.put(`/criteria/${id}`, data);
      const criteria = await api.get<Criteria[]>("/criteria");
      set({ criteria });
      toast.success("Kriteria berhasil diperbarui");
    } catch (err) {
      toast.error(`Gagal memperbarui kriteria: ${(err as Error).message}`);
      throw err;
    }
  },
  remove: async (id) => {
    try {
      await api.delete(`/criteria/${id}`);
      const criteria = await api.get<Criteria[]>("/criteria");
      set({ criteria });
      toast.success("Kriteria berhasil dihapus");
    } catch (err) {
      toast.error(`Gagal menghapus kriteria: ${(err as Error).message}`);
      throw err;
    }
  },
  fetchSubCriteria: async (criteriaId) => {
    const list = await api.get<SubCriteria[]>(`/criteria/${criteriaId}/sub-criteria`);
    set((s) => ({ subCriteria: { ...s.subCriteria, [criteriaId]: list } }));
  },
  createSubCriteria: async (criteriaId, data) => {
    try {
      await api.post(`/criteria/${criteriaId}/sub-criteria`, data);
      const list = await api.get<SubCriteria[]>(`/criteria/${criteriaId}/sub-criteria`);
      set((s) => ({ subCriteria: { ...s.subCriteria, [criteriaId]: list } }));
      toast.success("Sub-kriteria berhasil ditambahkan");
    } catch (err) {
      toast.error(`Gagal menambah sub-kriteria: ${(err as Error).message}`);
      throw err;
    }
  },
  updateSubCriteria: async (id, data) => {
    try {
      await api.put(`/sub-criteria/${id}`, data);
      toast.success("Sub-kriteria berhasil diperbarui");
    } catch (err) {
      toast.error(`Gagal memperbarui sub-kriteria: ${(err as Error).message}`);
      throw err;
    }
  },
  removeSubCriteria: async (id, criteriaId) => {
    try {
      await api.delete(`/sub-criteria/${id}`);
      set((s) => ({
        subCriteria: {
          ...s.subCriteria,
          [criteriaId]: (s.subCriteria[criteriaId] ?? []).filter((sc) => sc.id !== id),
        },
      }));
      toast.success("Sub-kriteria berhasil dihapus");
    } catch (err) {
      toast.error(`Gagal menghapus sub-kriteria: ${(err as Error).message}`);
      throw err;
    }
  },
}));
