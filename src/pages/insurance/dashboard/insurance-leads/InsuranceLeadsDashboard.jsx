import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useEffect, useState } from "react";
export default function InsuranceLeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
const [dateFilter, setDateFilter] = useState("");
  const BASE_URL =
    import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    fetchLeads();
  }, []);

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

      const leadsRes = await fetch(
        `${BASE_URL}/api/insurance?orgId=${orgId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await leadsRes.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
      alert("Cannot load insurance leads.");
    } finally {
      setLoading(false);
    }
  }
  const filteredLeads = leads.filter((lead) => {
  const matchesSearch =
    (lead.name || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (lead.phone || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (lead.source || "")
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesDate = dateFilter
    ? new Date(lead.createdAt)
        .toISOString()
        .slice(0, 10) === dateFilter
    : true;

  return matchesSearch && matchesDate;
});

  if (loading)
    return <div className="p-8">Loading insurance leads...</div>;

  return (
    <div className="p-8">

  {/* Title + Back */}
  <div className="flex items-center justify-between mb-6">
    
    <h1 className="text-3xl font-bold">
      Insurance Enquiries
    </h1>
    <DashboardNavbar />

    {/* <Link to="/insurance/dashboard">
      <Button className="text-white px-4 py-2">
        ← Back to Dashboard
      </Button>
    </Link> */}
  </div>

  {/* Search */}
  <div className="flex flex-wrap gap-4 mb-6 items-center">
  <input
    type="text"
    placeholder="Search name / phone / source..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border px-4 py-2 rounded-lg w-72"
  />

  {/* Date Filter */}
  <input
    type="date"
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value)}
    className="border px-4 py-2 rounded-lg"
  />

  {/* Clear Filters */}
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
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Created At</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  No insurance leads found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-t">
                  <td className="px-4 py-3">{lead.id}</td>
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="px-4 py-3">{lead.phone}</td>
                  <td className="px-4 py-3">{lead.source}</td>
                  <td className="px-4 py-3">
                    {new Date(lead.createdAt).toLocaleString()}
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