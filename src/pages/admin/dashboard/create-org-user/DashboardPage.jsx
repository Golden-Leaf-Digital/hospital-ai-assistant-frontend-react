import DashboardNavbar from "@/components/DashboardNavbar";
import CreateOrgUserForm from "./CreateOrgUserForm";
import OrgUsersList from "./OrgUsersList";

export default function DashboardPage() {
  return (
    <div className="p-8">
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Organization Users
        </h1>

        <DashboardNavbar />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-10 gap-8">
  {/* 30% Form */}
  <div className="lg:col-span-3">
    <CreateOrgUserForm />
  </div>

  {/* 70% Table */}
  <div className="lg:col-span-7">
    <OrgUsersList />
  </div>
</div>
    </div>
  );
}