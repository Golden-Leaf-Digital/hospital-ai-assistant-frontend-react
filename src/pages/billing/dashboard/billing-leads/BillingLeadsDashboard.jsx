import Button from "@/components/Button";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
export default function BillingLeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    fetchLeads();
  }, []);

   const STATUS_OPTIONS = [
    "PENDING",
    "CONTACTED",
    "IN_PROGRESS",
    "RESOLVED",
    "REJECTED",
  ];


  async function fetchLeads() {
    try {
      const token = localStorage.getItem("token");

      const userRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userRes.ok) throw new Error("Failed to fetch user");

      const user = await userRes.json();
      const orgId = user.orgId;

      const leadsRes = await fetch(`${BASE_URL}/api/billing?orgId=${orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await leadsRes.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
      alert("Cannot load billing leads.");
    } finally {
      setLoading(false);
    }
  }

async function updateStatus(id, status) {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${BASE_URL}/api/billing/lead/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  }


  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone || "").toLowerCase().includes(search.toLowerCase());

    const matchesDate = dateFilter
      ? new Date(lead.createdAt).toISOString().slice(0, 10) === dateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  if (loading) return <div className="p-8">Loading billing leads...</div>;

  return (
    <div className="p-8">
      {/* Navbar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold mb-6">Billing Enquiries</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search name / phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-72"
        />

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        />

        <Button
          className="px-4 py-2"
          onClick={() => {
            setSearch("");
            setDateFilter("");
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Leads Count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {filteredLeads.length} of {leads.length} leads
      </p>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Created At</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  No billing leads found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{lead.id}</td>
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{lead.phone || "N/A"}</span>

                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="bg-green-100 text-green-700 p-1 rounded-full hover:bg-green-200 transition"
                          title="Call"
                        >
                          <Phone size={16} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium
        ${lead.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
        ${lead.status === "CONTACTED" ? "bg-blue-100 text-blue-700" : ""}
        ${lead.status === "IN_PROGRESS" ? "bg-purple-100 text-purple-700" : ""}
        ${lead.status === "RESOLVED" ? "bg-green-100 text-green-700" : ""}
        ${lead.status === "REJECTED" ? "bg-red-100 text-red-700" : ""}
      `}
                      >
                        {lead.status || "PENDING"}
                      </span>

                      <select
                        value={lead.status || "PENDING"}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="border rounded px-2 py-1 text-xs cursor-pointer"
                        title="Update status"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
