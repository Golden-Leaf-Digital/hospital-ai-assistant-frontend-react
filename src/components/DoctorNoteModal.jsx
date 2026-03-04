import { useEffect, useState } from "react";
import Button from "./Button";
import { addDoctorNote, getDoctorNotes } from "./appointment";

export default function DoctorNoteModal({
  appointmentId,
  onClose,
}) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    const data = await getDoctorNotes(appointmentId);
    setNotes(data);
  }

  async function handleAdd() {
    if (!text.trim()) return;

    await addDoctorNote(appointmentId, text);
    setText("");
    loadNotes();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[500px] rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          Doctor Notes
        </h2>

        {/* Notes list */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="border p-3 rounded"
            >
              <div className="text-sm text-gray-500">
                {n.doctorName} •{" "}
                {new Date(
                  n.createdAt
                ).toLocaleString()}
              </div>
              <div>{n.note}</div>
            </div>
          ))}
        </div>

        {/* Add note */}
        <textarea
          className="border w-full p-2 rounded"
          placeholder="Write clinical note..."
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>

          <Button onClick={handleAdd}>
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
}