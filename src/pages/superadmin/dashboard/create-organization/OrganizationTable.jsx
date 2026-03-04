import axiosInstance from "@/utils/axiosInstance";
import { useState } from "react";

export default function OrganizationTable({ organizations }) {
  const [orgs, setOrgs] = useState(organizations);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  /* -------------------- DELETE -------------------- */
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/organizations/${id}`);
      setOrgs((prev) => prev.filter((o) => o.orgId !== id));
    } catch {
      alert("Delete failed");
    }
  };

  /* -------------------- UPDATE -------------------- */
  const handleSave = async (org) => {
    try {
      await axiosInstance.put(`/organizations/${org.orgId}`, org);
      setEditingId(null);
      alert("Updated!");
    } catch {
      alert("Update failed");
    }
  };

  /* -------------------- LOCAL EDIT -------------------- */
  const updateField = (id, field, value) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.orgId === id ? { ...o, [field]: value } : o
      )
    );
  };
  const filteredOrgs = orgs.filter((org) =>
  org.orgName.toLowerCase().includes(search.toLowerCase()) ||
  org.orgShortform.toLowerCase().includes(search.toLowerCase()) ||
  org.adminEmail.toLowerCase().includes(search.toLowerCase())
);

  /* -------------------- UI -------------------- */

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-6">Organizations</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center mb-6">
  <input
    type="text"
    placeholder="Search organization..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border px-4 py-2 rounded-lg w-72"
  />
</div>
        {filteredOrgs.map((org) => (
          <div
            key={org.orgId}
            className="grid grid-cols-4 gap-4 items-center border-b py-3"
          >
            {/* ORG NAME */}
            <input
              value={org.orgName}
              disabled={editingId !== org.orgId}
              onChange={(e) =>
                updateField(org.orgId, "orgName", e.target.value)
              }
              className={`bg-transparent outline-none px-2 py-1 rounded 
              ${
                editingId === org.orgId
                  ? "border border-gray-400 bg-white"
                  : ""
              }`}
            />

            {/* SHORTFORM */}
            <input
              value={org.orgShortform}
              disabled={editingId !== org.orgId}
              onChange={(e) =>
                updateField(
                  org.orgId,
                  "orgShortform",
                  e.target.value
                )
              }
              className={`bg-transparent outline-none px-2 py-1 rounded 
              ${
                editingId === org.orgId
                  ? "border border-gray-400 bg-white"
                  : ""
              }`}
            />

            {/* EMAIL */}
            <input
              value={org.adminEmail}
              disabled={editingId !== org.orgId}
              onChange={(e) =>
                updateField(
                  org.orgId,
                  "adminEmail",
                  e.target.value
                )
              }
              className={`bg-transparent outline-none px-2 py-1 rounded 
              ${
                editingId === org.orgId
                  ? "border border-gray-400 bg-white"
                  : ""
              }`}
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              {editingId === org.orgId ? (
                <>
                  <button
                    onClick={() => handleSave(org)}
                    className="px-4 py-1.5 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1.5 rounded-md border text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingId(org.orgId)}
                    className="px-4 py-1.5 rounded-md bg-[#FF4242] text-white text-sm hover:bg-red-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(org.orgId)}
                    className="px-4 py-1.5 rounded-md border border-red-500 text-red-500 text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}