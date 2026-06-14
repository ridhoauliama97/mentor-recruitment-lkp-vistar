import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import type { ReactNode } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { token, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !token) {
      navigate("/login", { replace: true });
    }
  }, [loading, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
