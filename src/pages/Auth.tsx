import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auth removed — redirect to dashboard
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  );
}
