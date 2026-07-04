import { useEffect, useRef, useState } from "react";
import { Save, AlertTriangle, Download, Upload, Loader2, KeyRound, Trash2 } from "@/components/ui/icons";
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
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (settings.app_name !== undefined) setAppName(settings.app_name);
    if (settings.institution !== undefined) setInstitution(settings.institution);
    if (settings.logo !== undefined) setLogo(settings.logo);
  }, [settings]);

  useEffect(() => {
    api.get<Record<string, string>>("/settings").then((s) => {
      if (s.gemini_api_key) setGeminiKey(s.gemini_api_key);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    await save({ app_name: appName, institution, logo });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo("");
    setLogoFile(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
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
      <h1 className="text-2xl font-bold text-primary">Pengaturan</h1>

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
            <label className="block text-sm font-medium mb-1">Logo Aplikasi</label>
            <div className="flex items-center gap-3">
              {logo ? (
                <div className="relative group">
                  <img src={logo} alt="Logo" className="h-10 w-10 object-contain rounded border" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-10 w-10 rounded border border-dashed border-muted-foreground/40 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
              <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                {logo ? "Ganti Logo" : "Pilih Logo"}
              </Button>
              {logoFile && <span className="text-xs text-muted-foreground truncate max-w-[160px]">{logoFile.name}</span>}
            </div>
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
          <CardTitle>Konfigurasi AI — Athena</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gemini API Key</label>
            <input
              type="password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Masukkan Gemini API Key"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Diperlukan untuk chatbot Athena. Dapatkan API key gratis di{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">aistudio.google.com</a>
            </p>
          </div>
          <Button
            onClick={async () => {
              try {
                await api.put("/settings", { gemini_api_key: geminiKey });
                toast.success("API Key berhasil disimpan");
              } catch {
                toast.error("Gagal menyimpan API Key");
              }
            }}
          >
            Simpan API Key
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
