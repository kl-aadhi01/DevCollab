import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import learnService from '../services/learnService';
import SubmissionForm from '../components/learn/SubmissionForm';
import MentorFeedback from '../components/learn/MentorFeedback';
import { toast } from 'react-hot-toast';

const ExerciseView = () => {
  const { id } = useParams();
  
  const [exerciseData, setExerciseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExercise = async () => {
    try {
      const data = await learnService.getExercise(id);
      setExerciseData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchExercise();
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await learnService.submitExercise(id, formData);
      toast.success('🎉 Exercise submitted successfully! Progress updated!');
      await fetchExercise();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit exercise');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading exercise workspace...</p>
      </div>
    );
  }

  if (error || !exerciseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-error p-4 rounded-xl border border-red-200 text-sm font-semibold mb-4">
          {error || 'Exercise details not found.'}
        </div>
        <Link to="/learn" className="text-primary font-bold hover:underline">
          ← Back to Learn
        </Link>
      </div>
    );
  }

  const { exercise, submission } = exerciseData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <Link to={`/learn/bootcamps/${exercise.bootcampId}/dashboard`} className="text-xs font-bold text-textSecondary hover:text-primary transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-textPrimary mt-2">{exercise.title}</h1>
          <p className="text-xs text-textSecondary mt-0.5">Week {exercise.week} Practical Exercise | Est. Time: {exercise.estimatedTime} mins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Exercise Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">Exercise Description</h3>
              <p className="text-sm text-textPrimary leading-relaxed">{exercise.description}</p>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">Instructions</h3>
              <div className="text-sm text-textPrimary whitespace-pre-wrap leading-relaxed bg-slate-50 border p-4 rounded-xl font-mono">
                {exercise.instructions}
              </div>
            </div>

            {exercise.expectedOutput && (
              <div>
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">Expected Output / Deliverables</h3>
                <p className="text-xs text-textSecondary">{exercise.expectedOutput}</p>
              </div>
            )}

            {exercise.requiredSkills?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Submission Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-base font-bold text-textPrimary">Your Submission</h3>
            {submission && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                  {submission.status.toUpperCase()}
                </span>
                <p className="text-xs text-textSecondary pt-1">Submitted at: {new Date(submission.submittedAt).toLocaleDateString()}</p>
              </div>
            )}
            
            <SubmissionForm
              onSubmit={handleSubmit}
              submissionType={exercise.submissionType}
              existingSubmission={submission}
            />
          </div>

          {submission && (
            <MentorFeedback submission={submission} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseView;
