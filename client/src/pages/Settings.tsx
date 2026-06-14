import { useEffect, useRef, useState } from "react";
import { Save, AlertTriangle, Download, Upload, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settingsStore";
import { api } from "@/lib/api";
import type { ExportData } from "@/types";

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { settings, loading, saving, fetch, save } = useSettingsStore();
  const [appName, setAppName] = useState("");
  const [institution, setInstitution] = useState("");
  const [importing, setImporting] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (settings.app_name !== undefined) setAppName(settings.app_name);
    if (settings.institution !== undefined) setInstitution(settings.institution);
  }, [settings]);

  const handleSave = async () => {
    await save({ app_name: appName, institution });
  };

  const handleReset = () => {
    if (window.confirm("Yakin ingin mereset semua data? Tindakan ini tidak bisa dibatalkan.")) {
    }
  };

  const handleExport = async () => {
    try {
      const data = await api.get<ExportData>("/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mentor-psi-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengexport data");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm("Yakin ingin mengimport data? Data yang ada saat ini akan diganti.")) {
      e.target.value = "";
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      await api.post("/export/import", data);
      alert("Data berhasil diimport");
      window.location.reload();
    } catch {
      alert("Gagal mengimport data. Pastikan format file benar.");
    }
    setImporting(false);
    e.target.value = "";
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Memuat...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1E3A5F]">Pengaturan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Aplikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Aplikasi</label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Instansi</label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Contoh: Universitas Indonesia"
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {importing ? "Mengimport..." : "Import JSON"}
            </Button>
          </div>
          <Button variant="destructive" onClick={handleReset}>
            <AlertTriangle className="mr-2 h-4 w-4" /> Reset Semua Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium mb-1">Password Lama</label>
              <input
                type="password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password Baru</label>
              <input
                type="password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              />
            </div>
            <Button
              variant="outline"
              disabled={pwSaving}
              onClick={async () => {
                if (pwForm.newPassword !== pwForm.confirmPassword) {
                  toast.error("Konfirmasi password tidak cocok");
                  return;
                }
                if (pwForm.newPassword.length < 6) {
                  toast.error("Password minimal 6 karakter");
                  return;
                }
                setPwSaving(true);
                try {
                  await api.put("/auth/password", {
                    currentPassword: pwForm.currentPassword,
                    newPassword: pwForm.newPassword,
                  });
                  toast.success("Password berhasil diubah");
                  setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                } catch (err) {
                  toast.error(`Gagal mengubah password: ${(err as Error).message}`);
                } finally {
                  setPwSaving(false);
                }
              }}
            >
              {pwSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              {pwSaving ? "Menyimpan..." : "Ubah Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tentang</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Aplikasi Rekrutmen Mentor</strong> — versi 1.0.0</p>
          <p>
            Menggunakan metode <strong>PSI (Preference Selection Index)</strong> untuk
            menentukan mentor terbaik secara objektif berdasarkan variasi data kriteria.
            PSI tidak memerlukan bobot dari pengambil keputusan — bobot dihitung otomatis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
