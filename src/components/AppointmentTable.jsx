import { Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { deleteAppointment, updateAppointment } from "./appointment";
import Button from "./Button";
import DoctorNoteModal from "./DoctorNoteModal";
export default function AppointmentTable({ appointments }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [rows, setRows] = useState(appointments);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    setRows(appointments);
  }, [appointments]);

  /* ================= FILTERING ================= */

  const filtered = useMemo(() => {
    return rows.filter((a) => {
      const matchesSearch =
        (
          (a.patientName || "") +
          (a.patientPhone || "") +
          (a.doctorName || "") +
          (a.department || "")
        )
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus = statusFilter
        ? a.status === statusFilter
        : true;

      const matchesDate = dateFilter
        ? new Date(a.startAt)
            .toISOString()
            .slice(0, 10) === dateFilter
        : true;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [rows, search, statusFilter, dateFilter]);

  /* ================= DELETE ================= */

  async function handleDelete(id) {
    const confirmDelete = confirm("Cancel this appointment?");
    if (!confirmDelete) return;

    await deleteAppointment(Number(id));

    // update UI without reload
    setRows((prev) =>
      prev.map((a) =>
        Number(a.id) === Number(id)
          ? { ...a, status: "CANCELLED" }
          : a
      )
    );
  }

  /* ================= RESCHEDULE ================= */

  async function handleReschedule(id) {
    const startAt = prompt("New Start DateTime (YYYY-MM-DDTHH:mm)");
    const endAt = prompt("New End DateTime (YYYY-MM-DDTHH:mm)");

    if (!startAt || !endAt) return;

    await updateAppointment(Number(id), { startAt, endAt });

    setRows((prev) =>
      prev.map((a) =>
        Number(a.id) === Number(id)
          ? { ...a, startAt, endAt }
          : a
      )
    );
  }

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-xl shadow">

      {/* Filters */}
      <div className="p-4 border-b flex flex-wrap gap-4 items-center">

        {/* Search */}
        <input
          placeholder="Search patient / doctor / phone..."
          className="border px-4 py-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="">All Status</option>
          <option value="BOOKED">BOOKED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border px-4 py-2 rounded"
        />

        {/* Clear */}
        <Button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setDateFilter("");
          }}
          variant="outline"
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Doctor</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">End</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-6">
                  No appointments found
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td
                    className="p-3 font-medium text-blue-600 cursor-pointer underline"
                    onClick={() =>
                      setSelectedAppointment(Number(a.id))
                    }
                  >
                    {a.patientName}
                  </td>
                  <td className="p-3">
  <div className="flex items-center gap-2">
    {a.patientPhone || "N/A"}

    {a.patientPhone && (
      <a
        href={`tel:${a.patientPhone}`}
        className="text-green-600 hover:text-green-800"
        title="Call patient"
      >
        <Phone size={18} />
      </a>
    )}
  </div>
</td>
                  <td className="p-3">{a.doctorName}</td>
                  <td className="p-3">{a.department}</td>
                  <td className="p-3">
                    {formatDate(a.startAt)}
                  </td>
                  <td className="p-3">
                    {formatDate(a.endAt)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="space-x-2 p-3">
                    {a.status !== "CANCELLED" && (
                      <>
                        <Button
                          onClick={() =>
                            handleReschedule(a.id)
                          }
                          variant="outline"
                        >
                          Reschedule
                        </Button>

                        <Button
                          onClick={() =>
                            handleDelete(a.id)
                          }
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedAppointment && (
        <DoctorNoteModal
          appointmentId={selectedAppointment}
          onClose={() =>
            setSelectedAppointment(null)
          }
        />
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function formatDate(date) {
  return new Date(date).toLocaleString();
}

function StatusBadge({ status }) {
  const colors = {
    BOOKED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs ${colors[status]}`}
    >
      {status}
    </span>
  );
}