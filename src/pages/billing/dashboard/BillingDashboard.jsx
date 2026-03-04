import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Link } from "react-router-dom";

export default function BillingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
    
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              Billing Dashboard
            </h1>
            <DashboardNavbar />
          </div>
    
          <Link to="/billing/dashboard/billing-leads">
            <Button className="text-white px-6 py-3 rounded-xl shadow-md">
              Billing Enquiries
            </Button>
          </Link>
        </div>
  );
}