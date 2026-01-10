import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

interface PomodoroTimerProps {
  onSessionComplete: (minutes: number, subject: string) => void;
  onStart: () => void;
  onStop: () => void;
  selectedSubject: string;
}

export default function PomodoroTimer({
  onSessionComplete,
  onStart,
  onStop,
  selectedSubject,
}: PomodoroTimerProps) {
  const POMODORO_STORAGE_KEY = "pomodoro_state";
  const [isActive, setIsActive] = useState(false);
  const [isWorkPeriod, setIsWorkPeriod] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settings, setSettings] = useState({
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4
  });

  // Số session đã hoàn thành
  const [completedSessions, setCompletedSessions] = useState(0);

  // Môn học hiện tại (được khóa khi timer đang chạy)
  const [currentSubject, setCurrentSubject] = useState(selectedSubject);

    // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Khôi phục trạng thái Pomodoro từ localStorage khi load trang
  useEffect(() => {
    const saved = localStorage.getItem(POMODORO_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      setIsActive(parsed.isActive);
      setIsWorkPeriod(parsed.isWorkPeriod);
      setCompletedSessions(parsed.completedSessions);
      setSettings(parsed.settings);
      setTime(parsed.time);
      setCurrentSubject(parsed.selectedSubject || "General Study");

      // Nếu timer đang chạy → trừ thời gian đã trôi qua
      if (parsed.isActive && parsed.lastUpdated) {
        const diffSeconds = Math.floor(
          (Date.now() - parsed.lastUpdated) / 1000
        );
        setTime((t) => Math.max(t - diffSeconds, 0));
      }
    } catch (e) {
      console.warn("Failed to restore pomodoro state", e);
    }
  }, []);

  // Chỉ cho phép đổi môn học khi timer KHÔNG chạy
  useEffect(() => {
    if (!isActive) {
      setCurrentSubject(selectedSubject);
    }
  }, [selectedSubject, isActive]);

  // Phát âm thanh theo sự kiện (start / complete)
  const playSound = async (soundName: string) => {
    if (!soundEnabled) return;

    const soundMap: Record<string, string> = {
      'timer-start': '/sounds/timer-start.mp3',
      'work-complete': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      'break-complete': 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
    };

    const volumeMap: Record<string, number> = {
      'timer-start': 0.5,
      'work-complete': 0.4,
      'break-complete': 0.45
    };

    const soundPath = soundMap[soundName];
    if (!soundPath) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      // Pre-load and check if audio can be played
      const audio = new Audio();

      // Add error handling for loading
      const loadPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener(
          'error',
          (e) => reject(new Error(`Failed to load sound: ${e.message}`)),
          { once: true }
        );
        audio.src = soundPath;
      });

      // Wait for audio to be loaded with timeout
      await Promise.race([
        loadPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sound loading timeout')), 5000)
        )
      ]);

      audio.volume = volumeMap[soundName] || 0.5;

      try {
        await audio.play();
      } catch (error) {
        throw new Error('Sound playback failed');
      }
    } catch (error) {
      console.warn(`Sound playback error (${soundName}):`, error);
      // Fallback to Web Audio API beep
      if (soundName !== 'timer-start') {
        await fallbackBeep(soundName === 'work-complete' ? 800 : 600);
      }
    }
  };

  // Âm beep fallback dùng Web Audio API
  const fallbackBeep = async (frequency: number): Promise<void> => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
        throw new Error('Web Audio API not supported');
      }

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.1;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audioContext.currentTime + 0.5
      );

      // Clean up after sound plays
      return new Promise((resolve) => {
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
          resolve();
        }, 500);
      });
    } catch (error) {
      console.warn('Fallback beep failed:', error);
      // If all sound playback fails, just show a notification
      toast.success('Timer completed!');
    }
  };

  // Hiển thị notification hệ thống
  const showNotification = (title: string, body: string) => {
    try {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            silent: true // We'll handle sound separately
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              showNotification(title, body);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Notification failed:', error);
      // Fallback to toast notification
      toast.success(`${title} - ${body}`);
    }
  };

  // Xử lý khi kết thúc 1 period (work hoặc break)
  const handlePeriodComplete = useCallback(() => {
    if (isWorkPeriod) {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      // Gửi dữ liệu session kèm môn học
      onSessionComplete(settings.workMinutes, currentSubject);

      // Kiểm tra có phải long break không
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setTime(settings.longBreakMinutes * 60);
        playSound('work-complete');
        showNotification('Time for a Long Break! 🎉', `Great job! You've completed ${settings.sessionsUntilLongBreak} work sessions.`);
        toast.success(
          <div>
            <p className="font-medium">Time for a long break!</p>
            <p className="text-sm">You've earned it! 🎉</p>
          </div>
        );
      } else {
        setTime(settings.breakMinutes * 60);
        playSound('work-complete');
        showNotification('Break Time! ☕', 'Well done! Take a short break.');
        toast.success(
          <div>
            <p className="font-medium">Great work!</p>
            <p className="text-sm">Time for a short break ☕</p>
          </div>
        );
      }
    } else {
      setTime(settings.workMinutes * 60);
      playSound('break-complete');
      showNotification('Back to Work! 💪', 'Break is over. Let\'s get back to it!');
      toast.success(
        <div>
          <p className="font-medium">Break is over</p>
          <p className="text-sm">Let's get back to work! 💪</p>
        </div>
      );
    }

    setIsWorkPeriod(!isWorkPeriod);
  }, [isWorkPeriod, completedSessions, settings, onSessionComplete]);

  // Start / Pause timer
  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      playSound('timer-start');
      onStart();
    } else {
      onStop();
    }
  };

  // Reset toàn bộ timer và xóa state lưu trữ
  const resetTimer = () => {
    setIsActive(false);
    setIsWorkPeriod(true);
    setTime(settings.workMinutes * 60);
    setCompletedSessions(0);
    onStop();
    localStorage.removeItem(POMODORO_STORAGE_KEY);
  };

  // Format mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Interval đếm ngược mỗi giây
  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            handlePeriodComplete();
            return isWorkPeriod ? settings.breakMinutes * 60 : settings.workMinutes * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isActive, isWorkPeriod, settings, handlePeriodComplete]);

  // Lưu state vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem(
      POMODORO_STORAGE_KEY,
      JSON.stringify({
        isActive,
        isWorkPeriod,
        time,
        completedSessions,
        settings,
        selectedSubject: currentSubject,
        lastUpdated: Date.now(),
      })
    );
  }, [
    isActive,
    isWorkPeriod,
    time,
    completedSessions,
    settings,
    currentSubject,
  ]);

  // UI
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">
          {isWorkPeriod ? 'Work Time' : 'Break Time'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label={showSettings ? 'Hide settings' : 'Show settings'}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {showSettings ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="workMinutes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Work Duration (minutes)
            </label>
            <input
              id="workMinutes"
              type="number"
              value={settings.workMinutes}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  workMinutes: Math.max(
                    1,
                    Math.min(120, parseInt(e.target.value) || 1)
                  )
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="120"
            />
          </div>
          <div>
            <label
              htmlFor="breakMinutes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Break Duration (minutes)
            </label>
            <input
              id="breakMinutes"
              type="number"
              value={settings.breakMinutes}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  breakMinutes: Math.max(
                    1,
                    Math.min(30, parseInt(e.target.value) || 1)
                  )
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="30"
            />
          </div>
          <div>
            <label
              htmlFor="longBreakMinutes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Long Break Duration (minutes)
            </label>
            <input
              id="longBreakMinutes"
              type="number"
              value={settings.longBreakMinutes}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  longBreakMinutes: Math.max(
                    1,
                    Math.min(60, parseInt(e.target.value) || 1)
                  )
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="60"
            />
          </div>
          <button
            onClick={() => {
              setShowSettings(false);
              resetTimer();
            }}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>
      ) : (
        <>
          <div
            className="text-6xl font-bold text-center mb-8"
            role="timer"
            aria-label={`${formatTime(time)} remaining`}
          >
            {formatTime(time)}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`p-4 rounded-full ${
                isActive
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
            >
              {isActive ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={resetTimer}
              className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label="Reset timer"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Session {completedSessions % settings.sessionsUntilLongBreak + 1} of {settings.sessionsUntilLongBreak}
          </div>
        </>
      )}
    </div>
  );
}