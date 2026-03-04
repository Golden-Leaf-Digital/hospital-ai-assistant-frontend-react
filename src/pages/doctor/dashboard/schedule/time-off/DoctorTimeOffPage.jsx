import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";

export default function DoctorTimeOffPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    startAt: "",
    endAt: "",
    reason: "Holiday",
  });

  useEffect(() => {
    fetchTimeOff();
  }, []);

  async function fetchTimeOff() {
    try {
      const res = await axiosInstance.get(
        "/api/v1/doctor-scheduling/me/time-off"
      );
      setList(res.data);
    } catch {
      alert("Failed to load time off");
    } finally {
      setLoading(false);
    }
  }

  async function addTimeOff() {
    try {
      await axiosInstance.post(
        "/api/v1/doctor-scheduling/me/time-off",
        form
      );
      fetchTimeOff();
      setForm({ startAt: "", endAt: "", reason: "Holiday" });
    } catch {
      alert("Failed to add time off");
    }
  }

  async function deleteTimeOff(id) {
    await axiosInstance.delete(
      `/api/v1/doctor-scheduling/me/time-off/${id}`
    );
    fetchTimeOff();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Doctor Leave / Holiday
        </h1>
        <DashboardNavbar />
      </div>

      {/* Add Leave Form */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Time Off</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            value={form.startAt}
            onChange={(e) =>
              setForm({ ...form, startAt: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="datetime-local"
            value={form.endAt}
            onChange={(e) =>
              setForm({ ...form, endAt: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
            className="border p-2 rounded col-span-2"
          />
        </div>

        <Button
          onClick={addTimeOff}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Add Leave
        </Button>
      </div>

      {/* Leave List */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Your Leaves</h2>

        {list.length === 0 && <p>No holidays added yet.</p>}

        {list.map((item) => (
          <div
            key={item.id}
            className="flex justify-between border-b py-3"
          >
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