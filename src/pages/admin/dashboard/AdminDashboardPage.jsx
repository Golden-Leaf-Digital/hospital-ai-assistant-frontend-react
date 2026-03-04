import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import OrgUsersList from "./create-org-user/OrgUsersList";

export default function AdminDashboardPage() {

 const token = localStorage.getItem("token");

let orgId = "org-62484079";

if (token) {
  try {
    const decoded = jwtDecode(token);
    orgId =
      decoded.orgId ||
      decoded.organizationId ||
      decoded.org ||
      "org-62484079";
  } catch (err) {
    console.error("Invalid token", err);
  }
}

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <DashboardNavbar />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">

        <Link to="/admin/dashboard/create-org-user">
          <Button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg">
            + Create  Organization User
          </Button>
        </Link>

        <Link to={`/${orgId}/whatsapp`}>
          <Button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg">
            WhatsApp Web
          </Button>
        </Link>

      </div>

      {/* Organization Users Table */}
      <OrgUsersList />

    </div>
  );
}