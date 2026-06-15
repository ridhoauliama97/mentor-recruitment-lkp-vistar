import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, FileSpreadsheet } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useCandidateStore } from "@/stores/candidateStore";
import type { Candidate } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
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

export default function Candidates() {
  const { candidates, loading, fetch, create, update, remove } = useCandidateStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState<Candidate | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", education: "", institution: "", expertise: "", bio: "",
  });

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await update(editing.id, form);
      } else {
        await create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", email: "", phone: "", education: "", institution: "", expertise: "", bio: "" });
    } catch {
      // error set by store, form stays open
    }
  };

  const handleEdit = (c: Candidate) => {
    setEditing(c);
    setForm({
      name: c.name, email: c.email, phone: c.phone ?? "", education: c.education ?? "",
      institution: c.institution ?? "", expertise: c.expertise ?? "", bio: c.bio ?? "",
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", education: "", institution: "", expertise: "", bio: "" });
    setShowForm(true);
  };

  const columns: ColumnDef<Candidate>[] = useMemo(() => [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.index + 1}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <Link to={`/candidates/${row.original.id}/scores`} className="text-sm font-medium text-secondary dark:text-white hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: "expertise",
      header: "Keahlian",
      cell: ({ row }) => <span className="text-sm">{row.original.expertise || "-"}</span>,
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
                <Link to={`/candidates/${row.original.id}/scores`}>
                  <Button variant="ghost" size="icon"><FileSpreadsheet className="h-4 w-4" /></Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Kriteria Kandidat</TooltipContent>
            </Tooltip>
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
        <h1 className="text-2xl font-bold text-primary">Kandidat</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kandidat
        </Button>
      </div>

      <DataTable columns={columns} data={candidates} pageSize={10} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kandidat" : "Tambah Kandidat Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No HP/WhatsApp</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pendidikan Terakhir</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                placeholder="Contoh: S1 Informatika"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Universitas/Institusi</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                placeholder="Contoh: Universitas Indonesia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keahlian</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.expertise}
                onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                placeholder="Contoh: Machine Learning"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Ceritakan tentang diri Anda"
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
            <AlertDialogTitle>Hapus Kandidat?</AlertDialogTitle>
            <AlertDialogDescription>
              Kandidat <strong>{deleting?.name}</strong> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (deleting) {
                try { await remove(deleting.id); } catch { /* error set by store */ }
              }
              setDeleting(null);
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
