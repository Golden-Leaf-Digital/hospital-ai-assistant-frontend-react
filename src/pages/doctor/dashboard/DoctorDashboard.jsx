import AppointmentTable from "@/components/AppointmentTable";
import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await axiosInstance.get("/api/appointments/doctor");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
      alert("Cannot load appointments. Please login again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return <div className="p-8">Loading appointments...</div>;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Doctor Dashboard
        </h1>
        <DashboardNavbar />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Link to="/doctor/dashboard/add-appointments">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
            + Add Appointment
          </Button>
        </Link>

        <Link to="/doctor/dashboard/schedule">
          <Button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
            Manage Schedule
          </Button>
        </Link>
      </div>

      <AppointmentTable appointments={appointments} />
    </div>
  );
}