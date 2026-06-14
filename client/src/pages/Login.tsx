import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { settings, fetch } = useSettingsStore();

  useEffect(() => {
    if (!settings.app_name) fetch();
  }, [settings.app_name, fetch]);

  const appName = settings.app_name ?? "LKP Academy Vistar";
  const institution = settings.institution ?? "SPK Rekrutmen Mentor AI Engineer";

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
    navigate("/");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm appName={appName} institution={institution} onLogin={handleLogin} />
      </div>
    </div>
  );
}
