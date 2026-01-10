import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { BarChart2, Clock, TrendingUp } from 'lucide-react';
// import { getStudySessions } from '../utils/storage';
// import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { StudyTimeSession } from '../types';

// Chuẩn hóa subject
const normalizeSubject = (s?: string) => s?.trim().toLowerCase();

// Chuẩn hóa date về dạng yyyy-MM-dd để so sánh
const normalizeDate = (d: string | number | Date) =>
  format(new Date(d), "yyyy-MM-dd");

export default function Analytics() {
  const [studyTime, setStudyTime] = useState<StudyTimeSession[]>([]);

  // Subject đang được chọn (All / Math / English...)
  const [selectedSubject, setSelectedSubject] = useState("All");

  // Trạng thái loading
  const [isLoading, setIsLoading] = useState(true);

  // Lỗi khi load dữ liệu
  const [error, setError] = useState<string | null>(null);

  // Chiều cao tối đa biểu đồ (px)
  const CHART_HEIGHT = 220;

  // Giới hạn tối đa 1 ngày học 8 tiếng
  const MAX_DAILY_MINUTES = 8 * 60;

  // Load dữ liệu
  useEffect(() => {
    try {
      // Lấy dữ liệu studyTime từ localStorage
      const saved = localStorage.getItem("studyTime");

      // Nếu có thì parse JSON, không có thì mảng rỗng
      setStudyTime(saved ? JSON.parse(saved) : []);
    } catch {
      // Nếu lỗi parse
      setError("Failed to load study data");
    } finally {
      // Dù thành công hay lỗi cũng tắt loading
      setIsLoading(false);
    }
  }, []);

  const subjects = [
    "All",
    ...Array.from(
      // Set để loại bỏ subject trùng nhau
      new Set(
        studyTime
          .map((s) => normalizeSubject(s.subject))
          .filter(Boolean)
      )
    ).map(
      // Viết hoa chữ cái đầu
      (s) => s![0].toUpperCase() + s!.slice(1)
    ),
  ];

  // Lọc dữ liệu theo subject đã chọn
  const filteredStudyTime =
    selectedSubject === "All"
      ? studyTime
      : studyTime.filter(
          (s) =>
            normalizeSubject(s.subject) ===
            normalizeSubject(selectedSubject)
        );

  // Tạo dữ liệu 7 ngày gần nhất
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    // Lấy ngày hiện tại trừ i ngày
    const date = subDays(new Date(), i);

    // Key ngày chuẩn hóa
    const dateKey = normalizeDate(date);

    // Tổng số phút học trong ngày đó
    const minutes = filteredStudyTime
      .filter((s) => normalizeDate(s.date) === dateKey)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      label: format(date, "MMM d"), // Nhãn hiển thị
      minutes,
    };
  }).reverse(); // Đảo lại để ngày cũ → mới

  // Tổng thời gian học (phút)
  const totalMinutes = filteredStudyTime.reduce(
    (acc, s) => acc + s.durationMinutes,
    0
  );

  // Số ngày có học (không tính ngày trống)
  const activeDays =
    new Set(filteredStudyTime.map((s) => normalizeDate(s.date))).size || 1;

  // Trung bình phút / ngày
  const averageMinutesPerDay = Math.round(
    totalMinutes / activeDays
  );

  // Đang loading
  if (isLoading) return <LoadingSpinner />;

  // Có lỗi
  if (error) {
    return (
      <p className="text-red-500 text-center py-8">
        {error}
      </p>
    );
  }

  // UI
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-8">
        Analytics
      </h1>

      {/* Subject selector */}
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="mb-6 px-3 py-2 border rounded-lg"
      >
        {subjects.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      {/* Stats cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Stat icon={<Clock />} title="Total Study Time">
          {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
        </Stat>

        <Stat icon={<TrendingUp />} title="Daily Average">
          {Math.floor(averageMinutesPerDay / 60)}h{" "}
          {averageMinutesPerDay % 60}m
        </Stat>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 size={20} className="text-gray-500" />
          <h2 className="font-semibold">
            Last 7 Days
          </h2>
        </div>

        {/* Không có dữ liệu */}
        {last7Days.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            No study activity
          </p>
        ) : (
          <div className="flex items-end gap-4 h-64">
            {last7Days.map((day) => {
              // Tính chiều cao bar
              const height =
                (day.minutes / MAX_DAILY_MINUTES) *
                CHART_HEIGHT;

              return (
                <div
                  key={day.label}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  {/* Bar */}
                  {day.minutes > 0 ? (
                    <div
                      className="w-full bg-indigo-600 rounded-t-lg relative group"
                      style={{ height: `${height}px` }}
                    >
                      {/* Tooltip */}
                      <div
                        className="absolute -top-7 left-1/2 -translate-x-1/2 
                        bg-gray-800 text-white text-xs px-2 py-1 rounded 
                        opacity-0 group-hover:opacity-100"
                      >
                        {day.minutes} phút
                      </div>
                    </div>
                  ) : (
                    // Nếu không có phút thì bar rất nhỏ
                    <div style={{ height: "1px" }} />
                  )}

                  {/* Label ngày */}
                  <span className="text-xs text-gray-500">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Component hiển thị 1 thẻ thống kê
function Stat({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <h3>{title}</h3>
      </div>
      <p className="text-3xl font-bold">
        {children}
      </p>
    </div>
  );
}