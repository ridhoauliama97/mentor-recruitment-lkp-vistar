import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useCandidateStore } from "@/stores/candidateStore";
import type { Candidate } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

export default function Candidates() {
  const { candidates, loading, error, fetch, create, update, remove } = useCandidateStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
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

  const columns: ColumnDef<Candidate>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <Link to={`/candidates/${row.original.id}/scores`} className="text-sm font-medium text-[#2E86AB] hover:underline">
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
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Link to={`/candidates/${row.original.id}/scores`}>
            <Button variant="ghost" size="icon"><FileSpreadsheet className="h-4 w-4" /></Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={async () => { try { await remove(row.original.id); } catch { /* error set by store */ } }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ], []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Memuat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Kandidat</h1>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", email: "", phone: "", education: "", institution: "", expertise: "", bio: "" }); }}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kandidat
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Kandidat" : "Tambah Kandidat Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telepon</label>
                <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pendidikan</label>
                <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Institusi</label>
                <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keahlian</label>
                <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmit}>{editing ? "Simpan" : "Tambah"}</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable columns={columns} data={candidates} pageSize={10} />
    </div>
  );
}
