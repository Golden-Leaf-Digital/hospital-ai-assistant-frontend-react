import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Link } from "react-router-dom";

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <DashboardNavbar />
      </div>

      {/* Actions Section */}
      <div className="bg-white shadow rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Organization Management
        </h2>

        <Link to="/admin/dashboard/create-org-user">
          <Button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition">
            Create Organization User
          </Button>
        </Link>
      </div>
    </div>
  );
}