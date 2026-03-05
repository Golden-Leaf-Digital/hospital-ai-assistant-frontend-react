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
      slots: [
        {
          startTime: "09:00",
          endTime: "17:00",
          slotMinutes: 15,
        },
      ],
    }))
  );

  function toggleDay(index) {
    const copy = [...week];
    copy[index].enabled = !copy[index].enabled;
    setWeek(copy);
  }

  function updateSlot(dayIndex, slotIndex, field, value) {
    const copy = [...week];
    copy[dayIndex].slots[slotIndex][field] = value;
    setWeek(copy);
  }

  function addSlot(dayIndex) {
    const copy = [...week];
    copy[dayIndex].slots.push({
      startTime: "09:00",
      endTime: "12:00",
      slotMinutes: 15,
    });
    setWeek(copy);
  }

  function removeSlot(dayIndex, slotIndex) {
    const copy = [...week];
    copy[dayIndex].slots.splice(slotIndex, 1);
    setWeek(copy);
  }

  async function saveSchedule() {
    try {
      setLoading(true);

      const payload = week
        .filter((d) => d.enabled)
        .map((d) => ({
          dayOfWeek: d.dayOfWeek,
          slots: d.slots,
        }));

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
        <h1 className="text-3xl font-bold">Doctor Weekly Schedule</h1>
        <DashboardNavbar />
      </div>

      <div className="mb-6">
        <Link to="/doctor/dashboard/schedule/time-off">
          <Button className="bg-[#FF4242] text-white px-5 py-2 rounded-lg">
            Manage Leave / Holiday
          </Button>
        </Link>
      </div>

      <div className="space-y-6">

        {week.map((day, dayIndex) => (
          <div
            key={day.dayOfWeek}
            className="bg-white shadow rounded-xl p-5"
          >
            {/* Day Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {DAYS[dayIndex].label}
              </h2>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={() => toggleDay(dayIndex)}
                />
                Working
              </label>
            </div>

            {day.enabled && (
              <>
                {day.slots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="flex items-center gap-4 mb-3"
                  >
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        updateSlot(
                          dayIndex,
                          slotIndex,
                          "startTime",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded"
                    />

                    <span>to</span>

                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateSlot(
                          dayIndex,
                          slotIndex,
                          "endTime",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded"
                    />

                    <input
                      type="number"
                      value={slot.slotMinutes}
                      onChange={(e) =>
                        updateSlot(
                          dayIndex,
                          slotIndex,
                          "slotMinutes",
                          Number(e.target.value)
                        )
                      }
                      className="border p-2 rounded w-24"
                    />

                    <button
                      onClick={() =>
                        removeSlot(dayIndex, slotIndex)
                      }
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSlot(dayIndex)}
                  className="text-[#FF4242] font-medium"
                >
                  + Add Time Slot
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={saveSchedule}
        className="mt-8 bg-[#FF4242] text-white px-6 py-2 rounded-lg"
      >
        {loading ? "Saving..." : "Save Schedule"}
      </Button>
    </div>
  );
}