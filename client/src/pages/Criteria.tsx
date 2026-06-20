import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useCriteriaStore } from "@/stores/criteriaStore";
import type { Criteria } from "@/types";
import type { ColumnDef, Row } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const weightColors: Record<number, string> = {
  1: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  2: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  4: "bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300",
  5: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
};

const labelMap: Record<number, string> = { 5: "Sangat Baik", 4: "Baik", 3: "Cukup", 2: "Kurang", 1: "Sangat Kurang" };

function SubCriteriaContent({ criteriaId }: { criteriaId: number }) {
  const { subCriteria, fetchSubCriteria, createSubCriteria, removeSubCriteria } = useCriteriaStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", weight: 5 });
  const [deletingSub, setDeletingSub] = useState<{ id: number } | null>(null);
  const items = subCriteria[criteriaId] ?? [];

  useEffect(() => {
    if (items.length === 0) fetchSubCriteria(criteriaId);
  }, [criteriaId, fetchSubCriteria, items.length]);

  const handleAdd = async () => {
    if (!form.name) return;
    await createSubCriteria(criteriaId, { ...form, displayOrder: items.length + 1 });
    setForm({ name: "", weight: 5 });
    setShowForm(false);
  };

  return (
    <div className="bg-muted/20 px-6 py-4">
      {items.length > 0 && (
        <div className="space-y-1 mb-3">
          {items.map((sc) => {
            const c = weightColors[sc.weight] ?? "bg-gray-100 dark:bg-gray-800";
            return (
              <div key={sc.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-card border">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${c}`}>
                    {sc.weight}
                  </span>
                  <span className="text-sm">{sc.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeletingSub({ id: sc.id })}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      {showForm ? (
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama level (contoh: Sangat Baik)"
          />
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map((w) => <option key={w} value={w}>{w} — {labelMap[w]}</option>)}
          </select>
          <Button size="sm" onClick={handleAdd}>Tambah</Button>
          <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Level
        </Button>
      )}

      <AlertDialog open={!!deletingSub} onOpenChange={() => setDeletingSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Sub-Kriteria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Sub-kriteria akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deletingSub) removeSubCriteria(deletingSub.id, criteriaId);
              setDeletingSub(null);
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CriteriaPage() {
  const { criteria, loading, fetch, create, update, remove } = useCriteriaStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Criteria | null>(null);
  const [deleting, setDeleting] = useState<Criteria | null>(null);
  const [form, setForm] = useState({ name: "", description: "", type: "benefit" as "benefit" | "cost", code: "", weightRef: 0, status: "active" as "active" | "inactive" });

  const nextCode = useMemo(() => {
    const nums = criteria
      .map((c) => c.code?.match(/^C(\d+)$/))
      .filter(Boolean)
      .map((m) => parseInt(m![1], 10))
      .sort((a, b) => b - a);
    return `C${(nums[0] ?? 0) + 1}`;
  }, [criteria]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async () => {
    if (editing) {
      await update(editing.id, form);
    } else {
      await create(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", description: "", type: "benefit", code: "", weightRef: 0, status: "active" });
  };

  const handleEdit = (c: Criteria) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "", type: c.type, code: c.code ?? "", weightRef: c.weightRef ?? 0, status: c.status ?? "active" });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", type: "benefit", code: nextCode, weightRef: 0, status: "active" });
    setShowForm(true);
  };

  const columns: ColumnDef<Criteria>[] = useMemo(() => [
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => <span className="text-sm font-mono font-medium text-muted-foreground">{row.original.code || "-"}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama Kriteria",
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "benefit" ? "success" : "warning"}>
          {row.original.type === "benefit" ? "Benefit" : "Cost"}
        </Badge>
      ),
    },
    {
      id: "weightRef",
      header: "Bobot",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.weightRef != null ? `${row.original.weightRef}%` : "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "success" : "secondary"}>
          {row.original.status === "active" ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <TooltipProvider>
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setDeleting(row.original)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hapus</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ], []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Memuat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Kriteria Penilaian</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kriteria
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={criteria}
        pageSize={10}
        getRowCanExpand={() => true}
        renderSubComponent={({ row }: { row: Row<Criteria> }) => (
          <SubCriteriaContent criteriaId={row.original.id} />
        )}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kriteria" : "Tambah Kriteria Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Kode</label>
              <input
                disabled
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Auto: C6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Kriteria</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Kompetensi Teknis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "benefit" | "cost" })}
              >
                <option value="benefit">Benefit</option>
                <option value="cost">Cost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bobot Referensi (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.weightRef}
                onChange={(e) => setForm({ ...form, weightRef: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Alasan pemberian bobot"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{editing ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kriteria?</AlertDialogTitle>
            <AlertDialogDescription>
              Kriteria <strong>{deleting?.name}</strong> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleting) remove(deleting.id);
              setDeleting(null);
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
