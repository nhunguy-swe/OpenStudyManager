import { useEffect, useState } from "react"; 
import { Plus, Trash2, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface TimetableItem {
  id: string;        
  subject: string;   
  day: number;       
  startTime: string;  
  endTime: string;   
  color: string;     
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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

// Hàm kiểm tra thời gian có phải buổi sáng không
const isMorning = (time: string) => {
  const hour = Number(time.split(":")[0]);
  return hour < 12;
};

export default function Timetable() {
  const [items, setItems] = useState<TimetableItem[]>([]);
  const [editing, setEditing] = useState<TimetableItem | null>(null);
  const [dragging, setDragging] = useState<TimetableItem | null>(null);
  const [newItem, setNewItem] = useState({
    subject: "",
    day: 1,
    startTime: "08:00",
    endTime: "09:00",
    color: COLORS[0],
  });
  useEffect(() => {
    const saved = localStorage.getItem("timetable");
    if (saved) {
      setItems(JSON.parse(saved)); // load dữ liệu cũ
    }
  }, []);

  useEffect(() => {
    // mỗi lần items thay đổi thì lưu lại
    localStorage.setItem("timetable", JSON.stringify(items));
  }, [items]);

  // Thêm môn học mới
  const addItem = () => {
    if (!newItem.subject.trim()) return; // không cho thêm nếu chưa nhập môn

    setItems((prev) => [
      {
        id: uuidv4(), // tạo id mới
        ...newItem,
      },
      ...prev,
    ]);

    // reset form
    setNewItem({
      subject: "",
      day: 1,
      startTime: "08:00",
      endTime: "09:00",
      color: COLORS[0],
    });
  };

  // Xóa môn học
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Render 1 item trong timetable
  const renderItem = (i: TimetableItem) => (
    <div
      key={i.id}
      draggable // cho phép kéo
      onDragStart={() => setDragging(i)} // lưu item đang kéo
      onDragOver={(e) => e.preventDefault()} // cho phép thả
      onDrop={() => {
        if (!dragging || dragging.id === i.id) return;

        // đổi day của item bị kéo sang day của item được thả
        setItems((prev) =>
          prev.map((x) => (x.id === dragging.id ? { ...x, day: i.day } : x))
        );
      }}
      onClick={() => setEditing(i)} // click để mở modal chỉnh sửa
      className={`p-2 rounded text-sm relative cursor-pointer ${i.color} shadow-sm`}
    >
      {/* NÚT XÓA */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // tránh click lan sang mở modal
          deleteItem(i.id);
        }}
        className="absolute top-1 right-1 text-gray-600 hover:text-red-600"
      >
        <Trash2 size={14} />
      </button>

      {/* TÊN MÔN */}
      <div className="font-medium truncate">{i.subject}</div>

      {/* GIỜ HỌC */}
      <div className="text-xs">
        {i.startTime} – {i.endTime}
      </div>
    </div>
  );

  // UI
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Timetable</h1>

      {/* FORM THÊM MỚI */}
      <div className="bg-white p-4 rounded-xl border mb-6 grid md:grid-cols-6 gap-3 items-end">
        {/* NHẬP TÊN MÔN */}
        <input
          placeholder="Subject"
          value={newItem.subject}
          onChange={(e) => setNewItem({ ...newItem, subject: e.target.value })}
          className={`border px-3 py-2 rounded md:col-span-2 outline-none`}
        />

        {/* CHỌN THỨ */}
        <select
          value={newItem.day}
          onChange={(e) =>
            setNewItem({ ...newItem, day: Number(e.target.value) })
          }
          className="border px-3 py-2 rounded"
        >
          {DAYS.map((d, i) => (
            <option key={d} value={i + 1}>
              {d}
            </option>
          ))}
        </select>

        {/* GIỜ BẮT ĐẦU */}
        <input
          type="time"
          value={newItem.startTime}
          onChange={(e) =>
            setNewItem({ ...newItem, startTime: e.target.value })
          }
          className="border px-3 py-2 rounded"
        />

        {/* GIỜ KẾT THÚC */}
        <input
          type="time"
          value={newItem.endTime}
          onChange={(e) => setNewItem({ ...newItem, endTime: e.target.value })}
          className="border px-3 py-2 rounded"
        />

        {/* NÚT ADD */}
        <button
          onClick={addItem}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add
        </button>

        {/* CHỌN MÀU */}
        <div className="flex gap-2 md:col-span-6">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setNewItem({ ...newItem, color: c })}
              className={`w-7 h-7 rounded-full ${c} ${
                newItem.color === c ? "ring-2 ring-indigo-500" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* LƯỚI THEO TUẦN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {DAYS.map((day, index) => (
          <div key={day} className="bg-white rounded-xl border p-3">
            <h3 className="font-semibold mb-3 text-center">{day}</h3>

            <div className="space-y-3">
              {/* BUỔI SÁNG */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1 text-center">
                  — Morning —
                </div>
                <div className="space-y-2">
                  {items
                    .filter(
                      (i) => i.day === index + 1 && isMorning(i.startTime)
                    )
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(renderItem)}
                </div>
              </div>

              {/* BUỔI CHIỀU */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1 text-center">
                  — Afternoon —
                </div>
                <div className="space-y-2">
                  {items
                    .filter(
                      (i) => i.day === index + 1 && !isMorning(i.startTime)
                    )
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(renderItem)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CHỈNH SỬA */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setEditing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Edit timetable</h2>
              <button onClick={() => setEditing(null)}>
                <X />
              </button>
            </div>

            {/* SỬA TÊN MÔN */}
            <input
              value={editing.subject}
              onChange={(e) =>
                setEditing({ ...editing, subject: e.target.value })
              }
              className={`w-full p-2 rounded mb-3 outline-none ${editing.color}`}
            />

            {/* SỬA GIỜ */}
            <div className="flex gap-2 mb-4">
              <input
                type="time"
                value={editing.startTime}
                onChange={(e) =>
                  setEditing({ ...editing, startTime: e.target.value })
                }
                className="border p-2 rounded w-1/2"
              />
              <input
                type="time"
                value={editing.endTime}
                onChange={(e) =>
                  setEditing({ ...editing, endTime: e.target.value })
                }
                className="border p-2 rounded w-1/2"
              />
            </div>

            {/* CHỌN MÀU */}
            <div className="flex gap-2 mb-5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setEditing({ ...editing, color: c })}
                  className={`w-7 h-7 rounded-full ${c} ${
                    editing.color === c ? "ring-2 ring-indigo-500" : ""
                  }`}
                />
              ))}
            </div>

            {/* SAVE */}
            <button
              onClick={() => {
                setItems((prev) =>
                  prev.map((i) => (i.id === editing.id ? editing : i))
                );
                setEditing(null);
              }}
              className="bg-indigo-600 text-white w-full py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}