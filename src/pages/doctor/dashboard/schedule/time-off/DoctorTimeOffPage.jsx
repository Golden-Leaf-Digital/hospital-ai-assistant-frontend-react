import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";

export default function DoctorTimeOffPage() {
  const [list, setList] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "Holiday",
  });

  useEffect(() => {
    fetchTimeOff();
  }, []);

  async function fetchTimeOff() {
    try {
      const res = await axiosInstance.get(
        "/api/v1/doctor-scheduling/me/time-off",
      );
      setList(res.data);
    } catch {
      alert("Failed to load time off");
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots(date) {
    try {
      const res = await axiosInstance.get(
        `/api/v1/doctor-scheduling/me/day-slots?date=${date}`,
      );
      setSlots(res.data);
    } catch {
      alert("Failed to load doctor schedule");
    }
  }

  async function addTimeOff() {
    if (!form.date || !form.startTime || !form.endTime) {
      alert("Select date and slot");
      return;
    }

    try {
      await axiosInstance.post("/api/v1/doctor-scheduling/me/time-off", {
        startAt: `${form.date}T${form.startTime}`,
        endAt: `${form.date}T${form.endTime}`,
        reason: form.reason,
      });

      setForm({
        date: "",
        startTime: "",
        endTime: "",
        reason: "Holiday",
      });

      fetchTimeOff();
    } catch {
      alert("Failed to add leave");
    }
  }

  async function deleteTimeOff(id) {
    await axiosInstance.delete(`/api/v1/doctor-scheduling/me/time-off/${id}`);
    fetchTimeOff();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Doctor Leave / Holiday</h1>
        <DashboardNavbar />
      </div>

      {/* Add Leave */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Leave</h2>

        {/* Date */}
        <input
          type="date"
          value={form.date}
          onChange={(e) => {
            const d = e.target.value;
            setForm({ ...form, date: d });
            loadSlots(d);
          }}
          className="border p-2 rounded w-full mb-4"
        />

        {/* Slot Selection */}
        {slots.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="font-semibold">Select Slot Leave</p>

            {slots.map((slot, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedSlot(i);
                  setForm({
                    ...form,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                  });
                }}
                className={`border rounded p-2 w-full text-left 
      ${selectedSlot === i ? "bg-blue-100 border-[#FF4242]" : "hover:bg-gray-100"}`}
              >
                {slot.startTime} → {slot.endTime}
              </button>
            ))}

            {/* Full Day */}
            <button
              onClick={() => {
                setSelectedSlot(null);
                setForm({
                  ...form,
                  startTime: "00:00",
                  endTime: "23:59",
                });
              }}
              className="border rounded p-2 w-full bg-red-50"
            >
              Full Day Leave
            </button>
          </div>
        )}

        {/* Reason */}
        <input
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          className="border p-2 rounded w-full mb-4"
        />

        <Button
          onClick={addTimeOff}
          className="bg-[#FF4242] hover:bg-[#FF4242] text-white px-6 py-2 rounded-lg"
        >
          Add Leave
        </Button>
      </div>

      {/* Leave List */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Your Leaves</h2>

        {list.length === 0 && <p>No holidays added yet.</p>}

        {list.map((item) => (
          <div key={item.id} className="flex justify-between border-b py-3">
            <div>
              <p>
                <b>From:</b> {new Date(item.startAt).toLocaleString()}
              </p>

              <p>
                <b>To:</b> {new Date(item.endAt).toLocaleString()}
              </p>

              <p>
                <b>Reason:</b> {item.reason}
              </p>
            </div>

            <Button
              onClick={() => deleteTimeOff(item.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
