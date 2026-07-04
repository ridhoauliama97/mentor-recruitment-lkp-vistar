import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, FileSpreadsheet, Upload } from "@/components/ui/icons";
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
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", education: "", major: "", expertise: "", photo_url: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

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
      setForm({ name: "", email: "", phone: "", education: "", major: "", expertise: "", photo_url: "" });
    } catch {
      // error set by store, form stays open
    }
  };

  const handleEdit = (c: Candidate) => {
    setEditing(c);
    setForm({
      name: c.name, email: c.email, phone: c.phone ?? "", education: c.education ?? "",
      major: c.major ?? "", expertise: c.expertise ?? "", photo_url: c.photoUrl ?? "",
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", education: "", major: "", expertise: "", photo_url: "" });
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const token = localStorage.getItem("auth_token");
      const res = await window.fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) setForm({ ...form, photo_url: data.url });
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const columns: ColumnDef<Candidate>[] = useMemo(() => [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.index + 1}</span>,
    },
    {
      id: "kandidat",
      header: "Kandidat",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <Link to={`/candidates/${c.id}/scores`} className="flex items-center gap-3 group">
            <div className="size-10 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {c.photoUrl ? (
                <img src={c.photoUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">{c.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-secondary dark:text-white group-hover:underline truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              <p className="text-xs text-muted-foreground truncate">{c.phone || "—"}</p>
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: "education",
      header: "Pendidikan",
      cell: ({ row }) => <span className="text-sm">{row.original.education || "-"}</span>,
    },
    {
      accessorKey: "major",
      header: "Jurusan",
      cell: ({ row }) => <span className="text-sm">{row.original.major || "-"}</span>,
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
                <Button variant="ghost" size="icon" className="group hover:bg-destructive hover:text-destructive-foreground dark:hover:bg-accent dark:hover:text-accent-foreground" onClick={() => setDeleting(row.original)}>
                  <Trash2 className="h-4 w-4 text-destructive group-hover:text-destructive-foreground dark:group-hover:text-accent-foreground" />
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
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
              >
                <option value="">Pilih Pendidikan</option>
                <option value="SMA">SMA</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jurusan/Program Studi</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                placeholder="Contoh: Ilmu Komputer"
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
              <label className="block text-sm font-medium mb-1">Pas Foto</label>
              <div className="flex items-center gap-3">
                {form.photo_url && (
                  <div className="size-14 rounded-full overflow-hidden border shrink-0">
                    <img src={form.photo_url} alt="Preview" className="size-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    <Upload className="mr-1 h-4 w-4" /> {uploading ? "Mengupload..." : "Pilih Foto"}
                  </Button>
                  {form.photo_url && (
                    <Button type="button" variant="ghost" size="sm" className="ml-2 text-destructive" onClick={() => setForm({ ...form, photo_url: "" })}>
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
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
