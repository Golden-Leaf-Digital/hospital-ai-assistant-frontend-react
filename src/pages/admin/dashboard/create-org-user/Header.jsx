import LogoutButton from "@/components/LogoutButton";
import { useEffect, useState } from "react";

/* -------------------- Fetch current user -------------------- */

async function getMe() {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/me`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data;
}

/* -------------------- Component -------------------- */

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const data = await getMe();
      setUser(data);
    }

    loadUser();
  }, []);

  if (!user) return null;

  return (
    <div className="flex items-center justify-between mb-8 pb-5 border-b">
      <div>
        <h1 className="text-2xl font-bold">Hospital Admin Dashboard</h1>
        <LogoutButton />
        <p className="text-gray-500 text-sm">
          Organization: {user.orgName}
        </p>
      </div>

      <div className="text-sm font-medium bg-gray-100 px-4 py-2 rounded-lg">
        {user.email}
      </div>
    </div>
  );
}