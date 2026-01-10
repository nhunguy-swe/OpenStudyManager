import { useState, useEffect } from 'react';
import { Subject, StudyTimeSession } from '../types';
import SubjectManager from '../components/SubjectManager';
import { Book, Plus, Clock } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const studySessions = useState<StudyTimeSession[]>(() => {
    const saved = localStorage.getItem('studyTime');
    return saved ? JSON.parse(saved) : [];
  })[0];

  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);

  const getWeeklyProgress = (subjectName: string) => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    const weeklyMinutes = studySessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return session.subject === subjectName &&
               sessionDate >= weekStart &&
               sessionDate <= weekEnd;
      })
      .reduce((acc, session) => acc + session.durationMinutes, 0);
    
    return weeklyMinutes / 60; // Convert to hours
  };

  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: crypto.randomUUID(),
    };
    setSubjects([...subjects, newSubject]);
    toast.success('Subject added successfully');
  };

  const handleEditSubject = (id: string, subjectData: Omit<Subject, 'id'>) => {
    setSubjects(subjects.map(subject =>
      subject.id === id ? { ...subject, ...subjectData } : subject
    ));
    toast.success('Subject updated successfully');
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    toast.success('Subject deleted successfully');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Book className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        </div>
        <button
          onClick={() => setShowManager(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Manage Subjects
        </button>
      </div>

      <div className="grid gap-4">
        {subjects.map(subject => {
          const weeklyHours = getWeeklyProgress(subject.name);
          const progress = (weeklyHours / subject.goalHoursPerWeek) * 100;
          
          return (
            <div
              key={subject.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={16} />
                  <span className="text-sm">
                    {weeklyHours.toFixed(1)} / {subject.goalHoursPerWeek}h this week
                  </span>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                  <div
                    style={{
                      width: `${Math.min(100, progress)}%`,
                      backgroundColor: subject.color,
                      transition: 'width 0.5s ease-in-out',
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Book className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
            <p className="text-gray-500 mb-4">
              Add subjects to track your study progress
            </p>
            <button
              onClick={() => setShowManager(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your first subject
            </button>
          </div>
        )}
      </div>

      {showManager && (
        <SubjectManager
          subjects={subjects}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  );
}