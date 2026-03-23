import { useState, useEffect } from 'react';
import { StudyTimeSession, StudyStreak, Subject } from '../types';
import PomodoroTimer from '../components/PomodoroTimer';
import StudyStreakComponent from '../components/StudyStreak';
import FocusMode from '../components/FocusMode';
import LoadingSpinner from '../components/LoadingSpinner';
import { GraduationCap } from 'lucide-react';
// import { getFromStorage, setToStorage } from '../utils/storage';

// Dữ liệu 1 mục trong thời khóa biểu
interface TimetableItem {
  id: string;
  subject: string;
  day: number; // 1-7 (Mon-Sun)
  startTime: string;
  endTime: string;
  color: string;
}

// Trang tổng quan Dashboard
export default function Dashboard() {
  // Key lưu subject đã chọn
  const SUBJECT_STORAGE_KEY = "selected_subject";
  // Trạng thái loading
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyTime, setStudyTime] = useState<StudyTimeSession[]>([]);
  const [isStudyActive, setIsStudyActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return localStorage.getItem(SUBJECT_STORAGE_KEY) || "General";
  });

  // Thời khóa biểu
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);

  // Streak học tập
  const [streak, setStreak] = useState<StudyStreak>({
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: new Date().toISOString()
  });

  // Theo dõi khi subject thay đổi
  useEffect(() => {
    console.log("Selected subject changed:", selectedSubject);
  }, [selectedSubject]);

  // Load dữ liệu ban đầu
  useEffect(() => {
    async function loadData() {
      try {
        // Load subjects
        const loadedSubjects: Subject[] = JSON.parse(
          localStorage.getItem("subjects") || "[]"
        );

        // Load study sessions
        const loadedStudyTime: StudyTimeSession[] = JSON.parse(
          localStorage.getItem("studyTime") || "[]"
        );

        // Load streak
        const loadedStreak: StudyStreak = JSON.parse(
          localStorage.getItem("streak") ||
            JSON.stringify({
              currentStreak: 0,
              bestStreak: 0,
              lastStudyDate: new Date().toISOString()
            })
        );

        // Load timetable
      const loadedTimetable: TimetableItem[] = JSON.parse(
        localStorage.getItem("timetable") || "[]"
      );
      // Cập nhật state
        setSubjects(loadedSubjects || []);
        setStudyTime(loadedStudyTime || []);
        setStreak(loadedStreak);
        setTimetable(loadedTimetable);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Lưu studyTime khi thay đổi
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('studyTime', JSON.stringify(studyTime));
    }
  }, [studyTime, isLoading]);

  // Lưu streak khi thay đổi
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('streak', JSON.stringify(streak));
    }
  }, [streak, isLoading]);

  // Xử lý khi hoàn thành phiên học
  const handleStudySessionComplete = (minutes: number) => {
    if (minutes <= 0) {
      console.error('Invalid study session duration');
      return;
    }

    try {
      // Tạo session mới
      const newSession: StudyTimeSession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        durationMinutes: minutes,
        subject: selectedSubject || 'General',
      };

      // Lưu session
      setStudyTime((prev) => [...prev, newSession]);

      // Update streak
      const today = new Date();
      const lastStudy = new Date(streak.lastStudyDate);

      // Reset giờ để so sánh theo ngày
      today.setHours(0, 0, 0, 0);
      lastStudy.setHours(0, 0, 0, 0);

      const timeDiff = Math.floor(
        (today.getTime() - lastStudy.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (timeDiff <= 1) {
        // Tiếp tục streak
        if (timeDiff === 1 || (timeDiff === 0 && streak.currentStreak === 0)) {
          setStreak((prev) => ({
            currentStreak: prev.currentStreak + 1,
            bestStreak: Math.max(
              prev.bestStreak,
              prev.currentStreak + 1
            ),
            lastStudyDate: today.toISOString()
          }));
        }
      } else {
        // Reset streak
        setStreak({
          currentStreak: 1,
          bestStreak: streak.bestStreak,
          lastStudyDate: today.toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to handle study session completion:', error);
    } finally {
      // Tắt trạng thái học
      setIsStudyActive(false);
      setSelectedSubject('');
    }
  };

  // Hiển thị loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // UI
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>

        {/* Focus Mode */}
        <FocusMode isStudyActive={isStudyActive} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left */}
        <div className="lg:col-span-2">
          <StudyStreakComponent streak={streak} />

          {/* Timetable preview */}
          <div className="mt-6">
            <TimetablePreview items={timetable} />
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {/* Subject select */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedSubject(value);
                localStorage.setItem(SUBJECT_STORAGE_KEY, value);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
              aria-label="Select study subject"
            >
              <option value="General">General Study</option>
              {subjects?.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.name}
                >
                  {subject.name}
                </option>
              ))}
            </select>

            {/* Pomodoro */}
            <PomodoroTimer
              selectedSubject={selectedSubject}
              onStart={() => setIsStudyActive(true)}
              onStop={() => setIsStudyActive(false)}
              onSessionComplete={(minutes) => {
                handleStudySessionComplete(minutes);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component preview thời khóa biểu tuần
function TimetablePreview({ items }: { items: TimetableItem[] }) {
  // Danh sách ngày trong tuần
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Kiểm tra buổi sáng hay chiều
  const isMorning = (time: string) => {
    const hour = Number(time.split(":")[0]);
    return hour < 12;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">
        📅 Weekly Timetable
      </h2>

      {/* Grid 7 ngày */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day, index) => {
          // Lọc lớp buổi sáng
          const morningItems = items
            .filter(
              (i) =>
                i.day === index + 1 &&
                isMorning(i.startTime)
            )
            .sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );

          // Lọc lớp buổi chiều
          const afternoonItems = items
            .filter(
              (i) =>
                i.day === index + 1 &&
                !isMorning(i.startTime)
            )
            .sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );

          return (
            <div
              key={day}
              className="bg-gray-50 rounded-lg p-3 space-y-3"
            >
              {/* Day */}
              <div className="text-sm font-semibold text-center text-gray-700">
                {day}
              </div>

              {/* MORNING */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1 text-center">
                  Morning
                </div>

                <div className="space-y-2">
                  {morningItems.length === 0 && (
                    <div className="text-xs text-gray-400 text-center">
                      No class
                    </div>
                  )}

                  {morningItems.map((item) => (
                    <div
                      key={item.id}
                      className={`relative group text-xs rounded-lg px-2 py-1 cursor-pointer ${item.color}`}
                    >
                      <div className="font-semibold truncate">
                        {item.subject}
                      </div>
                      <div>
                        {item.startTime} – {item.endTime}
                      </div>

                      {/* TOOLTIP */}
                      <div className="absolute z-50 hidden group-hover:block -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                          <div className="font-semibold">{item.subject}</div>
                          <div>
                            🕒 {item.startTime} – {item.endTime}
                          </div>
                          <div>📅 {days[item.day - 1]}</div>
                          <div>🌤 Morning</div>
                        </div>

                        {/* Arrow */}
                        <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AFTERNOON */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1 text-center">
                  Afternoon
                </div>

                <div className="space-y-2">
                  {afternoonItems.length === 0 && (
                    <div className="text-xs text-gray-400 text-center">
                      No class
                    </div>
                  )}

                  {afternoonItems.map((item) => (
                    <div
                      key={item.id}
                      className={`relative group text-xs rounded-lg px-2 py-1 cursor-pointer ${item.color}`}
                    >
                      <div className="font-semibold truncate">
                        {item.subject}
                      </div>
                      <div>
                        {item.startTime} – {item.endTime}
                      </div>

                      {/* TOOLTIP */}
                      <div className="absolute z-50 hidden group-hover:block -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                          <div className="font-semibold">{item.subject}</div>
                          <div>
                            🕒 {item.startTime} – {item.endTime}
                          </div>
                          <div>📅 {days[item.day - 1]}</div>
                          <div>🌤 Afternoon</div>
                        </div>

                        {/* Arrow */}
                        <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}