import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Avatar from '../common/Avatar';
import { toast } from 'react-hot-toast';

const StarRating = ({ value, onChange, label }) => {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-textSecondary">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-lg transition-transform hover:scale-110 focus:outline-none ${star <= value ? 'text-amber-400' : 'text-slate-200'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
};

const RatingModal = ({ project, currentUser, onClose }) => {
  const teammates = (project?.members || []).filter(m => (m._id || m.id) !== (currentUser?._id || currentUser?.id));
  const [selectedTeammate, setSelectedTeammate] = useState(teammates[0] || null);
  const [reliability, setReliability] = useState(5);
  const [codeQuality, setCodeQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRatings, setSubmittedRatings] = useState([]);

  useEffect(() => {
    const fetchSubmitted = async () => {
      if (!project?._id) return;
      try {
        const res = await API.get(`/ratings/project/${project._id}`);
        setSubmittedRatings(res.data.map(r => r.ratedUserId.toString()));
      } catch (err) {
        console.error('Failed to fetch submitted ratings:', err);
      }
    };
    fetchSubmitted();
  }, [project?._id]);

  if (!project || teammates.length === 0) return null;

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeammate) return;

    setSubmitting(true);
    try {
      await API.post('/ratings', {
        projectId: project._id,
        ratedUserId: selectedTeammate._id || selectedTeammate.id,
        reliability: Number(reliability),
        codeQuality: Number(codeQuality),
        communication: Number(communication),
        comment
      });

      toast.success(`Rating submitted for ${selectedTeammate.name}!`);
      const targetId = (selectedTeammate._id || selectedTeammate.id).toString();
      setSubmittedRatings(prev => [...prev, targetId]);

      // Move to next unrated teammate if available
      const remaining = teammates.filter(m => !submittedRatings.includes((m._id || m.id).toString()) && (m._id || m.id).toString() !== targetId);
      if (remaining.length > 0) {
        setSelectedTeammate(remaining[0]);
        setReliability(5);
        setCodeQuality(5);
        setCommunication(5);
        setComment('');
      } else {
        toast.success('All teammate ratings completed!');
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const isRated = (memberId) => submittedRatings.includes(memberId.toString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4 py-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-border bg-slate-50 relative flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-textPrimary">Post-Project Peer Ratings</h3>
            <p className="text-xs text-textSecondary mt-0.5">Rate your teammates on {project.name}</p>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Teammate Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Select Teammate to Rate</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {teammates.map((m) => {
                const mId = (m._id || m.id).toString();
                const rated = isRated(mId);
                const isSelected = selectedTeammate && (selectedTeammate._id || selectedTeammate.id).toString() === mId;

                return (
                  <button
                    key={mId}
                    onClick={() => {
                      setSelectedTeammate(m);
                      setReliability(5);
                      setCodeQuality(5);
                      setCommunication(5);
                      setComment('');
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-white text-textSecondary hover:bg-slate-50'
                    }`}
                  >
                    <Avatar user={m} size="sm" />
                    <span>{m.name}</span>
                    {rated && <span className="text-emerald-500 font-bold ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTeammate && (
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div className="p-4 bg-slate-50 border border-border rounded-2xl space-y-2">
                <StarRating label="Reliability & Commitment" value={reliability} onChange={setReliability} />
                <StarRating label="Code & Execution Quality" value={codeQuality} onChange={setCodeQuality} />
                <StarRating label="Communication & Collaboration" value={communication} onChange={setCommunication} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">Feedback / Comments (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs resize-none"
                  placeholder={`Write a brief peer review for ${selectedTeammate.name}...`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold border border-border rounded-xl text-textSecondary hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isRated((selectedTeammate._id || selectedTeammate.id).toString())}
                  className="px-5 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {isRated((selectedTeammate._id || selectedTeammate.id).toString())
                    ? 'Already Rated ✓'
                    : submitting
                    ? 'Submitting...'
                    : 'Submit Rating'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
