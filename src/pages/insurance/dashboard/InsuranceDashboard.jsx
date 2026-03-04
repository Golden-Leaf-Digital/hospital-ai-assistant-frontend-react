import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Link } from "react-router-dom";
export default function InsuranceDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Insurance Dashboard
        </h1>
        <DashboardNavbar />
      </div>

      <Link to="/insurance/dashboard/insurance-leads">
        <Button className="text-white px-6 py-3 rounded-xl shadow-md">
          Insurance Enquiries
        </Button>
      </Link>
    </div>
  );
}