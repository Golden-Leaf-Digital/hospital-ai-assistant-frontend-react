import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrganizations } from "./create-organization/OrgActions";
import OrganizationTable from "./create-organization/OrganizationTable";

export default function SuperAdminDashboard() {
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    const data = await getOrganizations();
    setOrgs(data);
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Super Admin Dashboard
        </h1>

        <DashboardNavbar />
      </div>

      {/* Action Button */}
      <Link to="/superadmin/dashboard/create-organization">
        <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg mb-6">
          Create Organization
        </Button>
      </Link>

      <OrganizationTable organizations={orgs} />
    </div>
  );
}