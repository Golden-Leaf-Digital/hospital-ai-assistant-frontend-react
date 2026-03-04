import DashboardNavbar from "@/components/DashboardNavbar";
import { useEffect, useState } from "react";
import CreateOrganizationForm from "./create-organization/CreateOrganizationForm";
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

      {/* Layout */}
      <div className="grid lg:grid-cols-10 gap-8">

        {/* Create Organization Form */}
        <div className="lg:col-span-3">
          <CreateOrganizationForm />
        </div>

        {/* Organization Table */}
        <div className="lg:col-span-7">
          <OrganizationTable organizations={orgs} />
        </div>

      </div>

    </div>
  );
}