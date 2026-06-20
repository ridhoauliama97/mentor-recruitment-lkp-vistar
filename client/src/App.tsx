import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AuthGuard from "@/components/AuthGuard";
import Chatbot from "@/components/chatbot";
import Dashboard from "@/pages/Dashboard";
import Candidates from "@/pages/Candidates";
import CandidateDetail from "@/pages/CandidateDetail";
import Criteria from "@/pages/Criteria";
import Calculation from "@/pages/Calculation";
import Results from "@/pages/Results";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Dokumentasi from "@/pages/Dokumentasi";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Layout>{children}</Layout>
      <Chatbot />
    </AuthGuard>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/candidates" element={<ProtectedLayout><Candidates /></ProtectedLayout>} />
      <Route path="/candidates/:id/scores" element={<ProtectedLayout><CandidateDetail /></ProtectedLayout>} />
      <Route path="/criteria" element={<ProtectedLayout><Criteria /></ProtectedLayout>} />
      <Route path="/calculation" element={<ProtectedLayout><Calculation /></ProtectedLayout>} />
      <Route path="/results" element={<ProtectedLayout><Results /></ProtectedLayout>} />
      <Route path="/results/:id" element={<ProtectedLayout><Results /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/dokumentasi" element={<Dokumentasi />} />
    </Routes>
  );
}
