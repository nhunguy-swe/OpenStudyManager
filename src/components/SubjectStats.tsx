import { useState } from 'react';
import { StudyTimeSession, Subject } from '../types';
import { Clock, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';

interface SubjectStatsProps {
  subject: Subject;
  sessions: StudyTimeSession[];
}

export default function SubjectStats({ subject, sessions }: SubjectStatsProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const getFilteredSessions = () => {
    const subjectSessions = sessions.filter(session => session.subject === subject.name);
    const now = new Date();
    
    switch (timeframe) {
      case 'week':
        return subjectSessions.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= startOfWeek(now) && sessionDate <= endOfWeek(now);
        });
      case 'month':
        return subjectSessions.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate.getMonth() === now.getMonth() &&
                 sessionDate.getFullYear() === now.getFullYear();
        });
      default:
        return subjectSessions;
    }
  };

  const filteredSessions = getFilteredSessions();
  const totalMinutes = filteredSessions.reduce((acc, session) => acc + session.durationMinutes, 0);
  const totalHours = totalMinutes / 60;
  const goalProgress = (totalHours / subject.goalHoursPerWeek) * 100;

  // Calculate trend
  const previousSessions = sessions
    .filter(session => session.subject === subject.name)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const trend = previousSessions.length >= 2
    ? previousSessions[0].durationMinutes - previousSessions[1].durationMinutes
    : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: subject.color }} 
          />
          <h3 className="font-semibold">{subject.name}</h3>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'all')}
          className="px-3 py-1 text-sm border rounded-lg"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock size={16} />
            <span className="text-sm">Total Time</span>
          </div>
          <p className="text-2xl font-bold">
            {Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m
          </p>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              {Math.abs(trend)} minutes
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Target size={16} />
            <span className="text-sm">Goal Progress</span>
          </div>
          <p className="text-2xl font-bold">{Math.round(goalProgress)}%</p>
          <div className="text-sm text-gray-500">
            {subject.goalHoursPerWeek}h weekly goal
          </div>
        </div>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(goalProgress, 100)}%`,
            backgroundColor: subject.color
          }}
        />
      </div>
    </div>
  );
}