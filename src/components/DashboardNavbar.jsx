import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DashboardNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);
  useEffect(() => {
  function handleClickOutside(e) {
    if (!e.target.closest(".profile-dropdown")) {
      setOpen(false);
    }
  }

  document.addEventListener("click", handleClickOutside);
  return () =>
    document.removeEventListener("click", handleClickOutside);
}, []);

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Profile load failed", err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  const dashboardMap = {
  insurance: "/insurance/dashboard",
  receptionist: "/receptionist/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
  superadmin: "/superadmin/dashboard",
  billing: "/billing/dashboard",
};

const dashboardPath =
  user?.role && dashboardMap[user.role.toLowerCase()]
    ? dashboardMap[user.role.toLowerCase()]
    : "/";

  return (
    <div className="flex justify-end items-center relative mb-6 profile-dropdown">
      {/* Profile Button */}
      <div
        onClick={() => user && setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition"
      >
        <User size={18} />
        <span className="font-medium">
          {user?.fullName || "Profile"}
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-14 w-72 bg-white shadow-xl rounded-xl p-4 z-50 border">
          
          {/* User Info */}
          <div className="mb-4 border-b pb-3">
            <p className="font-semibold text-gray-800">
              {user?.fullName}
            </p>
            <p className="text-sm text-gray-500">
              📧 {user?.email}
            </p>
            <p className="text-sm text-gray-500">
              📱 {user?.mobile}
            </p>
          </div>

          {/* Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
          >
            <User size={16} />
            Profile
          </Link>

          {/* My Dashboard */}
         {user?.role && (
  <Link
    to={dashboardPath}
    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
  >
    <LayoutDashboard size={16} />
    My Dashboard
  </Link>
)}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition w-full text-left"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}