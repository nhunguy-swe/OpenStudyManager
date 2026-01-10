import { useState } from 'react';
import { StudyTimeSession, Subject } from '../types';
import { BarChart2, Download } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface StudyStatsProps {
  sessions: StudyTimeSession[];
  subjects: Subject[];
}

export default function StudyStats({ sessions, subjects }: StudyStatsProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const getFilteredSessions = () => {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return sessions.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= startOfWeek(now) && sessionDate <= endOfWeek(now);
        });
      case 'month':
        return sessions.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate.getMonth() === now.getMonth() &&
                 sessionDate.getFullYear() === now.getFullYear();
        });
      default:
        return sessions;
    }
  };

  const exportStats = () => {
    const filteredSessions = getFilteredSessions();
    const stats = subjects.map(subject => {
      const subjectSessions = filteredSessions.filter(s => s.subject === subject.name);
      const totalMinutes = subjectSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        subject: subject.name,
        totalHours: (totalMinutes / 60).toFixed(1),
        sessionsCount: subjectSessions.length
      };
    });

    const csv = [
      ['Subject', 'Total Hours', 'Number of Sessions'],
      ...stats.map(s => [s.subject, s.totalHours, s.sessionsCount])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-stats-${timeframe}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredSessions = getFilteredSessions();
  const subjectStats = subjects.map(subject => {
    const subjectSessions = filteredSessions.filter(s => s.subject === subject.name);
    const totalMinutes = subjectSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      subject,
      totalHours: totalMinutes / 60,
      percentage: totalMinutes / filteredSessions.reduce((acc, s) => acc + s.durationMinutes, 0) * 100
    };
  }).sort((a, b) => b.totalHours - a.totalHours);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-indigo-600" />
          <h3 className="font-semibold">Study Statistics</h3>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'all')}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={exportStats}
            className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {subjectStats.map(({ subject, totalHours, percentage }) => (
          <div key={subject.id}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="font-medium">{subject.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {totalHours.toFixed(1)}h ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: subject.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}