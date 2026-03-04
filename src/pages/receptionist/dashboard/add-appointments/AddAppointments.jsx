import AddAppointmentForm from "@/components/AddAppointmentForm";
import DashboardNavbar from "@/components/DashboardNavbar";

export default function AddAppointments() {
  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Add Appointment
        </h1>

        <DashboardNavbar />
      </div>

      <AddAppointmentForm />
    </div>
  );
}