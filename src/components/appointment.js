import axiosInstance from "../utils/axiosInstance";

/* ================= DOCTORS ================= */

export async function getDoctors() {
  const res = await axiosInstance.get("/api/doctors");
  return res.data;
}

export async function getAvailableSlots(doctorId, date) {
  const res = await axiosInstance.get(
    `/api/appointments/available-slots?doctorId=${doctorId}&date=${date}`
  );
  return res.data;
}

/* ================= DOCTOR NOTES ================= */

export async function getDoctorNotes(appointmentId) {
  const res = await axiosInstance.get(
    `/api/doctor-notes/${appointmentId}`
  );
  return res.data;
}

export async function addDoctorNote(appointmentId, note) {
  const res = await axiosInstance.post(
    `/api/doctor-notes/${appointmentId}`,
    { note }
  );
  return res.data;
}

/* ================= APPOINTMENTS ================= */

// All org appointments (receptionist)
export async function getAllAppointments() {
  const res = await axiosInstance.get("/api/appointments");
  return res.data;
}

// Doctor appointments
export async function getDoctorAppointments() {
  const res = await axiosInstance.get(
    "/api/appointments/doctor"
  );
  return res.data;
}

/* ================= CREATE ================= */

export async function createAppointment(data) {
  const res = await axiosInstance.post(
    "/api/appointments",
    data
  );
  return res.data;
}

/* ================= UPDATE (Reschedule) ================= */

export async function updateAppointment(id, data) {
  const res = await axiosInstance.put(
    `/api/appointments/${id}`,
    data
  );
  return res.data;
}

/* ================= DELETE (Cancel) ================= */

export async function deleteAppointment(id) {
  const res = await axiosInstance.delete(
    `/api/appointments/${id}`
  );
  return res.data;
}