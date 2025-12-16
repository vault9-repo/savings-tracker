import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== role) {
      navigate("/", { replace: true });
    }
  }, [navigate, role]);

  return <>{children}</>;
}
