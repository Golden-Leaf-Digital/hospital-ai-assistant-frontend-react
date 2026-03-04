import DashboardNavbar from "@/components/DashboardNavbar";
import { useEffect, useState } from "react";
import CreateOrganizationForm from "./CreateOrganizationForm";
import { getOrganizations } from "./OrgActions";
import OrganizationTable from "./OrganizationTable";

export default function CreateOrganizationPage() {
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
          Manage Organizations
        </h1>

        <DashboardNavbar />
      </div>

      {/* 30-70 Layout */}
      <div className="grid lg:grid-cols-10 gap-8">

        {/* 30% Form */}
        <div className="lg:col-span-3">
          <CreateOrganizationForm />
        </div>

        {/* 70% Table */}
        <div className="lg:col-span-7">
          <OrganizationTable organizations={orgs} />
        </div>

      </div>
    </div>
  );
}