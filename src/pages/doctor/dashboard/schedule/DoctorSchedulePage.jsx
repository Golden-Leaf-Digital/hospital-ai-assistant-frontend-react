import Button from "@/components/Button";
import DashboardNavbar from "@/components/DashboardNavbar";
import axiosInstance from "@/utils/axiosInstance";
import { useState } from "react";
import { Link } from "react-router-dom";

const DAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 7 },
];

export default function DoctorSchedulePage() {
  const [loading, setLoading] = useState(false);

  const [week, setWeek] = useState(
    DAYS.map((d) => ({
      dayOfWeek: d.value,
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      slotMinutes: 15,
    }))
  );

  function updateDay(index, field, value) {
    const copy = [...week];
    copy[index][field] = value;
    setWeek(copy);
  }

  async function saveSchedule() {
    try {
      setLoading(true);

      const payload = week
        .filter((d) => d.enabled)
        .map(({ enabled, ...rest }) => rest);

      await axiosInstance.post(
        "/api/v1/doctor-scheduling/me/weekly-schedule",
        payload
      );

      alert("Schedule saved successfully!");
    } catch (err) {
      alert("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Weekly Schedule
        </h1>
        <DashboardNavbar />
      </div>

      {/* Leave Button */}
      <div className="mb-6">
        <Link to="/doctor/dashboard/schedule/time-off">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg">
            Manage Leave / Holiday
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th>Working</th>
              <th>Day</th>
              <th>Start</th>
              <th>End</th>
              <th>Slot (mins)</th>
            </tr>
          </thead>

          <tbody>
            {week.map((day, i) => (
              <tr key={day.dayOfWeek} className="border-b">
                <td>
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) =>
                      updateDay(i, "enabled", e.target.checked)
                    }
                  />
                </td>

                <td className="py-3">{DAYS[i].label}</td>

                <td>
                  <input
                    type="time"
                    disabled={!day.enabled}
                    value={day.startTime}
                    onChange={(e) =>
                      updateDay(i, "startTime", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                </td>

                <td>
                  <input
                    type="time"
                    disabled={!day.enabled}
                    value={day.endTime}
                    onChange={(e) =>
                      updateDay(i, "endTime", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    disabled={!day.enabled}
                    value={day.slotMinutes}
                    onChange={(e) =>
                      updateDay(
                        i,
                        "slotMinutes",
                        Number(e.target.value)
                      )
                    }
                    className="border p-2 rounded w-24"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Button
          onClick={saveSchedule}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Saving..." : "Save Weekly Schedule"}
        </Button>
      </div>
    </div>
  );
}