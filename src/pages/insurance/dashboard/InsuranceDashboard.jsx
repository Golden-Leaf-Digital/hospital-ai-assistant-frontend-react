import DashboardNavbar from "@/components/DashboardNavbar";
import InsuranceLeadsDashboard from "./insurance-leads/InsuranceLeadsDashboard";
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

      <InsuranceLeadsDashboard />
    </div>
  );
}