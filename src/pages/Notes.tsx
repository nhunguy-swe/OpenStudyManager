import { useEffect, useState } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Thư viện drag & drop
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// Kiểu dữ liệu note
interface Note {
  id: string; 
  title: string; 
  content: string; 
  subject: string; 
  color: string; 
  createdAt: string;
}

const COLORS = [
  "bg-amber-200",
  "bg-emerald-200",
  "bg-sky-200",
  "bg-rose-200",
  "bg-violet-200",
  "bg-teal-200",
  "bg-lime-200",
  "bg-fuchsia-200",
];

export default function Notes() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filterSubject, setFilterSubject] = useState("All");
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    subject: "",
    color: COLORS[0],
  });
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Load notes từ localStorage khi mount
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) {
      setNotes(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Lưu notes vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (!isLoaded) return; // tránh ghi đè khi chưa load xong
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes, isLoaded]);

  // Thêm note mới
  const addNote = () => {
    if (!newNote.content.trim()) return; // không cho note rỗng

    setNotes([
      {
        id: uuidv4(), // tạo id
        ...newNote, // title, content, subject, color
        createdAt: new Date().toISOString(),
      },
      ...notes, // thêm lên đầu danh sách
    ]);

    // Reset form tạo note
    setNewNote({
      title: "",
      content: "",
      subject: "",
      color: COLORS[0],
    });
  };

  // Xóa note theo id
  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // Cập nhật note đang chỉnh sửa
  const updateNote = () => {
    if (!editingNote) return;

    setNotes(notes.map((n) => (n.id === editingNote.id ? editingNote : n)));
    setEditingNote(null); // đóng modal
  };

  // Xử lý khi kéo thả note
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(notes);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setNotes(items);
  };

  // Danh sách subject (unique)
  const subjects = [
    "All",
    ...Array.from(new Set(notes.map((n) => n.subject))).filter(Boolean),
  ];

  // Notes sau khi filter
  const filteredNotes =
    filterSubject === "All"
      ? notes
      : notes.filter((n) => n.subject === filterSubject);

  // UI
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Notes</h1>

      {/* CREATE NOTE */}
      <div className="bg-white p-4 rounded-xl border mb-6 space-y-3">
        {/* Title */}
        <input
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Content */}
        <textarea
          placeholder="Write your note..."
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          className="w-full border px-3 py-2 rounded resize-none h-24"
        />

        {/* Subject + Color + Add */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            placeholder="Subject"
            value={newNote.subject}
            onChange={(e) =>
              setNewNote({ ...newNote, subject: e.target.value })
            }
            className={`border px-3 py-2 rounded`}
          />

          {/* Color picker */}
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setNewNote({ ...newNote, color: c })}
              className={`w-8 h-8 rounded-full ${c} border ${
                newNote.color === c ? "ring-2 ring-indigo-500" : ""
              }`}
            />
          ))}

          {/* Add note */}
          <button
            onClick={addNote}
            className="ml-auto flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* FILTER SUBJECT */}
      <select
        value={filterSubject}
        onChange={(e) => setFilterSubject(e.target.value)}
        className="mb-6 border rounded-xl px-3 py-2"
      >
        {subjects.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      {/* NOTES GRID + DRAG */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="notes" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filteredNotes.map((note, index) => (
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => setEditingNote(note)}
                      className={`p-4 rounded-xl relative cursor-move ${note.color}`}
                    >
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // không mở modal
                          deleteNote(note.id);
                        }}
                        className="absolute top-2 right-2"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Title */}
                      {note.title && (
                        <h3 className="font-semibold mb-1 text-sm line-clamp-2">
                          {note.title}
                        </h3>
                      )}

                      {/* Content */}
                      <p className="text-sm text-gray-700">{note.content}</p>

                      {/* Subject */}
                      {note.subject && (
                        <span className="text-xs text-gray-500 mt-2 block">
                          #{note.subject}
                        </span>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* EDIT MODAL */}
      {editingNote && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setEditingNote(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-3xl p-6 rounded-xl 
              ${editingNote.color} 
              transition-all duration-300 ease-out
              animate-scaleIn
              flex flex-col
              max-h-[85vh] overflow-hidden`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Edit note</h2>
              <button onClick={() => setEditingNote(null)}>
                <X />
              </button>
            </div>

            {/* Title */}
            <input
              value={editingNote.title}
              onChange={(e) =>
                setEditingNote({
                  ...editingNote,
                  title: e.target.value,
                })
              }
              className={`w-full border-transparent px-3 py-2 rounded mb-2 ${editingNote.color} focus:ring-2 focus:ring-white/60 focus:outline-none`}
            />

            {/* Content */}
            <textarea
              value={editingNote.content}
              onChange={(e) => {
                setEditingNote({
                  ...editingNote,
                  content: e.target.value,
                });

                // Auto resize textarea
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              className={`w-full border-transparent px-3 py-2 rounded mb-3
              ${editingNote.color}
              overflow-y-auto
              hide-scrollbar 
              focus:ring-2 focus:ring-white/60 focus:outline-none`}
              style={{
                minHeight: "130px",
                maxHeight: "40vh",
              }}
            />

            {/* Subject */}
            <input
              value={editingNote.subject}
              onChange={(e) =>
                setEditingNote({
                  ...editingNote,
                  subject: e.target.value,
                })
              }
              className={`border-transparent px-3 py-2 rounded mb-3 w-full ${editingNote.color} focus:ring-2 focus:ring-white/60 focus:outline-none`}
            />

            {/* Color picker */}
            <div className="flex gap-2 mb-4">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setEditingNote({ ...editingNote, color: c })}
                  className={`w-8 h-8 rounded-full ${c} border ${
                    editingNote.color === c ? "ring-2 ring-indigo-500" : ""
                  }`}
                />
              ))}
            </div>

            {/* Save */}
            <button
              onClick={updateNote}
              className="w-full bg-indigo-600 text-white py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}