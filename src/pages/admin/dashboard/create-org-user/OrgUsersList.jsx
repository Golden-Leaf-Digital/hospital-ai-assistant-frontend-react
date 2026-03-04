import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteOrgUserAction,
  getOrgUsers,
  updateOrgUserAction,
} from "./actions";

/* -------------------- Component -------------------- */

export default function OrgUsersList() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
const [roleFilter, setRoleFilter] = useState("");

  /* -------------------- Fetch users -------------------- */
  async function fetchUsers() {
    const data = await getOrgUsers();
    setUsers(data);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  /* -------------------- Edit -------------------- */
  function startEdit(user) {
    setEditingId(user.orgUserId);
    setForm(user);
  }

  async function handleUpdate(id) {
    const res = await updateOrgUserAction(id, {
      name: form.name,
      email: form.email,
      mobile: form.mobile,
      userRoleName: form.userRoleName,
    });

    alert(res.message);
    setEditingId(null);
    fetchUsers();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user?")) return;

    const res = await deleteOrgUserAction(id);
    alert(res.message);
    fetchUsers();
  }
  const filteredUsers = users.filter((u) => {
  const matchesSearch =
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.mobile || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.userRoleName || "")
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesRole = roleFilter
    ? u.userRoleName === roleFilter
    : true;

  return matchesSearch && matchesRole;
});

  /* -------------------- UI -------------------- */

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-xl font-semibold mb-4">
  Organization Users
</h3>

<div className="flex flex-wrap gap-4 mb-6 items-center">
  
  {/* Search */}
  <input
    type="text"
    placeholder="Search name / email / mobile / role..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border px-4 py-2 rounded-lg w-72"
  />

  {/* Role Filter */}
  <select
    value={roleFilter}
    onChange={(e) => setRoleFilter(e.target.value)}
    className="border px-4 py-2 rounded-lg"
  >
    <option value="">All Roles</option>
    <option value="DOCTOR">Doctor</option>
    <option value="RECEPTIONIST">Receptionist</option>
    <option value="STAFF">Staff</option>
    <option value="INSURANCE">Insurance</option>
    <option value="BILLING">Billing</option>
  </select>

  {/* Clear Button */}
  <button
    onClick={() => {
      setSearch("");
      setRoleFilter("");
    }}
    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
  >
    Clear
  </button>
</div>
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Mobile</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.orgUserId} className="border-t hover:bg-gray-50">
              {editingId === u.orgUserId ? (
                <>
                  <td className="border p-2">
                    <input
                      value={form.name ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="border p-1"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      value={form.email ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="border p-1"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      value={form.mobile ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, mobile: e.target.value })
                      }
                      className="border p-1"
                    />
                  </td>

                  <td className="border p-2">
                    <select
                      value={form.userRoleName ?? "ADMIN"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          userRoleName: e.target.value,
                        })
                      }
                      className="border p-1"
                    >
                      <option value="DOCTOR">Doctor</option>
                      <option value="RECEPTIONIST">Receptionist</option>
                      <option value="STAFF">Staff</option>
                    </select>
                  </td>

                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleUpdate(u.orgUserId)}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border p-2">{u.name}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">
  <div className="flex items-center gap-2">
    {u.mobile}

    <a
      href={`tel:${u.mobile}`}
      className="text-green-600 hover:text-green-800"
      title="Call"
    >
      <Phone size={18} />
    </a>
  </div>
</td>
                  <td className="border p-2">{u.userRoleName}</td>

                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => startEdit(u)}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(u.orgUserId)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}