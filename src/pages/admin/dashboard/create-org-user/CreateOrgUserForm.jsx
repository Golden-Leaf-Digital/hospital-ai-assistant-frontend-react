import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
import { createOrgUserAction } from "./actions";

export default function CreateOrgUserForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [role, setRole] = useState("DOCTOR");
  const [departments, setDepartments] = useState([]);

  /* -------------------- Load departments -------------------- */
  /* -------------------- Load departments -------------------- */
  useEffect(() => {
    async function loadDepartments() {
      try {
        const orgId = localStorage.getItem("orgId"); // get org id

        const res = await axiosInstance.get("/api/v1/departments", {
          params: { orgId },
        });

        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    }

    loadDepartments();
  }, []);

  /* -------------------- Submit -------------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setLoading(true);
    setMsg("");

    const formData = new FormData(e.currentTarget);
    const res = await createOrgUserAction(formData);

    setLoading(false);
    setMsg(res.message);

    if (res.ok) {
      formEl.reset();
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl border shadow-sm flex flex-col gap-4 w-full"
    >
      <h3 className="text-xl font-semibold">Add Doctor / Staff</h3>

      <input
        name="name"
        placeholder="Full Name"
        required
        className="p-3 border rounded-md"
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="p-3 border rounded-md"
      />

      <input
        name="mobile"
        placeholder="Mobile"
        required
        className="p-3 border rounded-md"
      />

      {/* ROLE SELECT */}
      <select
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="p-3 border rounded-md"
      >
        <option value="DOCTOR">Doctor</option>
        <option value="RECEPTIONIST">Receptionist</option>
        <option value="STAFF">Staff</option>
        <option value="INSURANCE">Insurance</option>
        <option value="BILLING">Billing</option>
      </select>

      {/* DEPARTMENT DROPDOWN ONLY FOR DOCTOR */}
      {role === "DOCTOR" && (
        <select name="departmentId" required className="p-3 border rounded-md">
          <option value="">Select Department</option>

          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}

      <button
        disabled={loading}
        className="bg-black text-white py-3 rounded-md"
      >
        {loading ? "Creating..." : "Create User"}
      </button>

      {msg && (
        <p className="text-sm text-center bg-gray-100 p-2 rounded">{msg}</p>
      )}
    </form>
  );
}
