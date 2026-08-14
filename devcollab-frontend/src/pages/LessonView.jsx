import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import learnService from '../services/learnService';
import { toast } from 'react-hot-toast';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await learnService.getLesson(id);
        setLesson(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await learnService.completeLesson(lesson._id);
      toast.success('⚡ Lesson marked complete! Progress updated!');
      navigate(`/learn/bootcamps/${lesson.bootcampId}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading lesson content...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-error p-4 rounded-xl border border-red-200 text-sm font-semibold mb-4">
          {error || 'Lesson not found.'}
        </div>
        <Link to="/learn" className="text-primary font-bold hover:underline">
          ← Back to Learn
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <Link to={`/learn/bootcamps/${lesson.bootcampId}/dashboard`} className="text-xs font-bold text-textSecondary hover:text-primary transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-textPrimary mt-2">{lesson.title}</h1>
          <p className="text-xs text-textSecondary mt-0.5">Week {lesson.week} Lesson | Duration: ~{lesson.duration} mins</p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
          lesson.difficulty === 'advanced' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          lesson.difficulty === 'intermediate' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
          'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {lesson.difficulty}
        </span>
      </div>

      {lesson.videoUrl && (
        <div className="bg-slate-900 aspect-video rounded-2xl overflow-hidden flex items-center justify-center border border-border shadow-sm">
          <a
            href={lesson.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-sm transition-all"
          >
            Play Video Lecture 📺
          </a>
        </div>
      )}

      {/* Content Text */}
      <div className="bg-white border border-border p-6 sm:p-8 rounded-2xl shadow-sm prose max-w-none text-textPrimary">
        <p className="text-sm font-semibold text-textSecondary mb-4 italic">{lesson.description}</p>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{lesson.content}</div>
      </div>

      {lesson.docUrl && (
        <div className="bg-slate-50 border border-border p-4 rounded-xl flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-textPrimary">Documentation / Reference Materials</h4>
            <p className="text-[10px] text-textSecondary">Read original guides or GitHub reference codes.</p>
          </div>
          <a
            href={lesson.docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold rounded-lg text-textPrimary transition-all shadow-xs"
          >
            Open Docs 🔗
          </a>
        </div>
      )}

      <div className="pt-4 flex justify-between gap-4">
        <Link
          to={`/learn/bootcamps/${lesson.bootcampId}/dashboard`}
          className="px-6 py-3 border border-border bg-white text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all text-center"
        >
          Curriculum Dashboard
        </Link>

        <button
          onClick={handleComplete}
          disabled={completing}
          className="px-8 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
        >
          {completing ? 'Completing...' : 'Complete & Back to Dashboard ⚡'}
        </button>
      </div>
    </div>
  );
};

export default LessonView;
