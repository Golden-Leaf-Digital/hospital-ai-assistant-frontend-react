import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return children;

  try {
    const decoded = jwtDecode(token);

    if (decoded?.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return children;
    }

    const role = decoded?.role;

    if (role === "USER") return <Navigate to="/dashboard" replace />;
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (role === "SUPERADMIN")
      return <Navigate to="/superadmin/dashboard" replace />;
    if (role === "DOCTOR")
      return <Navigate to="/doctor/dashboard" replace />;
    if (role === "RECEPTIONIST")
      return <Navigate to="/receptionist/dashboard" replace />;
    if (role === "INSURANCE")
      return <Navigate to="/insurance/dashboard" replace />;
    if (role === "BILLING")
      return <Navigate to="/billing/dashboard" replace />;

    return children;
  } catch {
    localStorage.removeItem("token");
    return children;
  }
}