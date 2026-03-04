import DashboardNavbar from "@/components/DashboardNavbar";
import BillingLeadsDashboard from "./billing-leads/BillingLeadsDashboard";

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
    
          <BillingLeadsDashboard/>
        </div>
  );
}