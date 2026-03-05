import { jwtDecode } from "jwt-decode";
import { Navigate, useLocation } from "react-router-dom";

const roleBasePath = {
  USER: "/",
  PATIENT: "/",
  ADMIN: "/admin",
  SUPERADMIN: "/superadmin",
  DOCTOR: "/doctor",
  RECEPTIONIST: "/receptionist",
  INSURANCE: "/insurance",
  BILLING: "/billing",
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

 if (!token) {
  const orgId = location.pathname.split("/")[1];
  return <Navigate to={`/${orgId}/otp-login`} replace />;
}

  try {
    const decoded = jwtDecode(token);

    // Expiry check
    if (decoded?.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to={`/${orgId}/otp-login`} replace />;
    }

    const role = decoded?.role;
    const pathname = location.pathname;

    const allowedBasePath = roleBasePath[role];

    if (!allowedBasePath) {
      localStorage.removeItem("token");
      return <Navigate to={`/${orgId}/otp-login`} replace />;
    }

    /* ================= ROLE-BASED ROUTE RESTRICTION ================= */

    // 🔒 If specific roles are required (like WhatsApp)
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to={`${allowedBasePath}/dashboard`} replace />;
    }

    /* ================= USER SPECIAL CASE ================= */

    if (role === "USER" || role === "PATIENT") {
      if (pathname === "/" || /^\/[^/]+\/webchat$/.test(pathname)) {
        return children;
      }

      return <Navigate to="/" replace />;
    }

    /* ================= INSURANCE SPECIAL CASE ================= */

    if (role === "INSURANCE" && !pathname.startsWith("/insurance")) {
      return <Navigate to="/insurance/dashboard" replace />;
    }

    /* ================= BASE PATH PROTECTION ================= */

    /* ================= ALLOW WHATSAPP ROUTE ================= */

    if (/^\/[^/]+\/whatsapp$/.test(pathname)) {
      return children;
    }

    /* ================= BASE PATH PROTECTION ================= */

    if (!pathname.startsWith(allowedBasePath)) {
      return <Navigate to={`${allowedBasePath}/dashboard`} replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("token");
    return (
  <Navigate
    to={`/${orgId}/otp-login`}
    state={{ from: location.pathname }}
    replace
  />
);
  }
}
