import { useState } from "react";
import { Note } from "../types";
export default function NoteEditor({
  note,
  onSave,
  onClose,
}: {
  note: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState(note);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <input
          placeholder="Title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full mb-3 text-lg font-semibold outline-none"
        />
        <textarea
          placeholder="Write your note..."
          value={data.content}
          onChange={(e) => setData({ ...data, content: e.target.value })}
          className="w-full h-32 resize-none outline-none"
        />
        <input
          placeholder="Subject (Math, English...)"
          value={data.subject}
          onChange={(e) => setData({ ...data, subject: e.target.value })}
          className="w-full mt-3 px-3 py-2 border rounded-lg"
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() =>
              onSave({ ...data, updatedAt: new Date().toISOString() })
            }
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
