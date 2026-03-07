import AppointmentTable from "@/components/AppointmentTable";
import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import axiosInstance from "@/utils/axiosInstance";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await axiosInstance.get("/api/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
      alert("Cannot load appointments. Please login again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8">Loading appointments...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Receptionist Dashboard</h1>

        <DashboardNavbar />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Link to="/receptionist/dashboard/add-appointments">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
            + Add Appointment
          </Button>
        </Link>
        <Link to={`/${orgId}/whatsapp`}>
          <Button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg">
            WhatsApp Web
          </Button>
        </Link>
      </div>

      {/* Appointment Table */}
      <AppointmentTable appointments={appointments} />
    </div>
  );
}
