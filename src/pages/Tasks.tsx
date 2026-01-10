import { useState, useEffect } from "react";
import { Task } from "../types";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load task từ localStorage khi component render lần đầu
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load / Save tasks từ localStorage
  useEffect(() => {
    // mỗi khi tasks thay đổi → lưu lại
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskComplete = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // TẠO MỚI TASK
  const handleCreateTask = (taskData: Omit<Task, "id" | "completed">) => {
    const newTask: Task = {
      ...taskData, // title, subject, deadline, ...
      id: crypto.randomUUID(), // tạo id duy nhất
      completed: false, // task mới mặc định chưa hoàn thành
    };

    setTasks([...tasks, newTask]); // thêm vào danh sách
    toast.success("Task created successfully");
  };

  // CHỈNH SỬA TASK
  const handleUpdateTask = (taskData: Omit<Task, "id" | "completed">) => {
    if (!editingTask) return; // nếu không có task đang sửa thì bỏ qua

    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              ...taskData,
              completed: task.completed,
            }
          : task
      )
    );
    toast.success("Task updated successfully");
  };

  // MỞ FORM CHỈNH SỬA TASK
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // XÓA TASK
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // UI
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>

        {/* NÚT TẠO TASK MỚI */}
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      {/* DANH SÁCH TASK */}
      <TaskList
        tasks={tasks}
        onTaskComplete={handleTaskComplete}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onTaskCreate={handleCreateTask}
      />

      {/* FORM THÊM / SỬA TASK */}
      {showForm && (
        <TaskForm
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          initialData={editingTask || undefined}
        />
      )}
    </div>
  );
}
