import { useEffect, useState } from "react";
import {
  createAppointment,
  getAvailableSlots,
  getDoctors,
} from "./appointment";

export default function AddAppointmentForm({ onCreated }) {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    doctorId: "",
    patientName: "",
    patientPhone: "",
    date: "",
    startTime: "",
  });

  // 🔹 load doctors once
  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    const data = await getDoctors();
    setDoctors(data);
  }

  // 🔹 load slots when doctor & date selected
  useEffect(() => {
    if (!form.doctorId || !form.date) {
      setSlots([]);
      return;
    }
    loadSlots();
  }, [form.doctorId, form.date]);

  async function loadSlots() {
    try {
      setLoadingSlots(true);
      const data = await getAvailableSlots(
        Number(form.doctorId),
        form.date
      );
      setSlots(data);
    } catch (e) {
      alert("Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  }

  // 🔹 submit appointment
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.startTime) {
      alert("Please select a slot");
      return;
    }

    try {
      await createAppointment({
        doctorId: Number(form.doctorId),
        patientName: form.patientName,
        patientPhone: form.patientPhone,
        startAt: form.startTime,
      });

      alert("Appointment created 🎉");

      // reset form
      setForm({
        doctorId: "",
        patientName: "",
        patientPhone: "",
        date: "",
        startTime: "",
      });

      setSlots([]);

      if (onCreated) onCreated();
    } catch (err) {
      console.error("Booking error:", err);

      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to create appointment";

      alert(apiMessage);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow border max-w-lg"
    >
      <h2 className="font-semibold text-lg">
        Create Appointment
      </h2>

      {/* 👨‍⚕️ Doctor */}
      <select
        className="border p-2 w-full"
        value={form.doctorId}
        onChange={(e) =>
          setForm({
            ...form,
            doctorId: e.target.value,
            startTime: "",
          })
        }
      >
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      {/* 👤 Patient Name */}
      <input
        placeholder="Patient Name"
        className="border p-2 w-full"
        value={form.patientName}
        onChange={(e) =>
          setForm({
            ...form,
            patientName: e.target.value,
          })
        }
      />

      {/* 📱 Patient Phone */}
      <input
        placeholder="Patient Phone"
        className="border p-2 w-full"
        value={form.patientPhone}
        onChange={(e) =>
          setForm({
            ...form,
            patientPhone: e.target.value,
          })
        }
      />

      {/* 📅 Date */}
      <input
        type="date"
        className="border p-2 w-full"
        value={form.date}
        onChange={(e) =>
          setForm({
            ...form,
            date: e.target.value,
            startTime: "",
          })
        }
      />

      {/* ⏱ Available Slots */}
      <select
        className="border p-2 w-full"
        value={form.startTime}
        onChange={(e) =>
          setForm({
            ...form,
            startTime: e.target.value,
          })
        }
        disabled={
          !form.doctorId || !form.date || loadingSlots
        }
      >
        <option value="">
          {loadingSlots
            ? "Loading slots..."
            : "Select Available Slot"}
        </option>

        {slots.map((slot) => (
          <option key={slot} value={slot}>
            {new Date(slot).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </option>
        ))}
      </select>

      {/* 🚫 No slots message */}
      {!loadingSlots &&
        form.date &&
        slots.length === 0 && (
          <p className="text-red-500 text-sm">
            No slots available for selected date
          </p>
        )}

      <button
        disabled={!form.startTime}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Create Appointment
      </button>
    </form>
  );
}