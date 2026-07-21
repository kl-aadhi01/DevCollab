import React, { useState } from 'react';
import MilestoneCard from './MilestoneCard';
import { toast } from 'react-hot-toast';

const RoadmapSection = ({ project, onUpdateRoadmap, isEditable }) => {
  const [roadmap, setRoadmap] = useState(project.roadmap || []);
  const [newPhase, setNewPhase] = useState('');
  const [newPhaseDesc, setNewPhaseDesc] = useState('');
  const [showAddPhase, setShowAddPhase] = useState(false);

  const [activePhaseIndex, setActivePhaseIndex] = useState(null);
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mDate, setMDate] = useState('');

  const handleStatusChange = async (title, newStatus) => {
    const updatedRoadmap = roadmap.map(phase => {
      const updatedMilestones = phase.milestones.map(m => {
        if (m.title === title) {
          return { ...m, status: newStatus };
        }
        return m;
      });
      return { ...phase, milestones: updatedMilestones };
    });
    setRoadmap(updatedRoadmap);
    try {
      await onUpdateRoadmap(updatedRoadmap);
      toast.success('Roadmap updated!');
    } catch (err) {
      toast.error('Failed to update roadmap');
    }
  };

  const handleAddPhase = async (e) => {
    e.preventDefault();
    if (!newPhase) return toast.error('Phase title required');
    const updatedRoadmap = [...roadmap, { phase: newPhase, description: newPhaseDesc, milestones: [] }];
    setRoadmap(updatedRoadmap);
    setNewPhase('');
    setNewPhaseDesc('');
    setShowAddPhase(false);
    try {
      await onUpdateRoadmap(updatedRoadmap);
      toast.success('New phase added!');
    } catch (err) {
      toast.error('Failed to add phase');
    }
  };

  const handleAddMilestone = async (phaseIndex) => {
    if (!mTitle) return toast.error('Milestone title required');

    const updatedRoadmap = roadmap.map((phase, idx) => {
      if (idx === phaseIndex) {
        return {
          ...phase,
          milestones: [...phase.milestones, {
            title: mTitle,
            description: mDesc,
            targetDate: mDate ? new Date(mDate) : null,
            status: 'pending'
          }]
        };
      }
      return phase;
    });

    setRoadmap(updatedRoadmap);
    setMTitle('');
    setMDesc('');
    setMDate('');
    setActivePhaseIndex(null);

    try {
      await onUpdateRoadmap(updatedRoadmap);
      toast.success('Milestone added!');
    } catch (err) {
      toast.error('Failed to add milestone');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-textPrimary">Project Roadmap</h3>
        {isEditable && (
          <button
            onClick={() => setShowAddPhase(!showAddPhase)}
            className="text-xs font-bold text-primary hover:underline"
          >
            {showAddPhase ? 'Cancel' : '+ Add Phase'}
          </button>
        )}
      </div>

      {showAddPhase && (
        <form onSubmit={handleAddPhase} className="p-4 border border-border bg-slate-50 rounded-xl space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Phase Title</label>
            <input
              type="text"
              value={newPhase}
              onChange={(e) => setNewPhase(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
              placeholder="e.g. Phase 1: MVP Release"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={newPhaseDesc}
              onChange={(e) => setNewPhaseDesc(e.target.value)}
              rows="2"
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white resize-none"
              placeholder="Goal of this development phase..."
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            Save Phase
          </button>
        </form>
      )}

      {roadmap.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-border">
          <span className="text-4xl">🗺️</span>
          <h4 className="text-sm font-bold text-textPrimary mt-4">No phases defined yet</h4>
          <p className="text-xs text-textSecondary mt-2">Define development phases to track milestones and project completion progress.</p>
        </div>
      ) : (
        roadmap.map((phase, phaseIdx) => (
          <div key={phase.phase} className="space-y-4 border border-border p-6 rounded-2xl bg-slate-50/20">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-bold text-textPrimary">{phase.phase}</h4>
                {phase.description && <p className="text-xs text-textSecondary mt-1">{phase.description}</p>}
              </div>
              {isEditable && activePhaseIndex !== phaseIdx && (
                <button
                  onClick={() => setActivePhaseIndex(phaseIdx)}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  + Add Milestone
                </button>
              )}
            </div>

            {isEditable && activePhaseIndex === phaseIdx && (
              <div className="p-4 border border-border bg-white rounded-xl space-y-4 max-w-sm">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-textPrimary uppercase">New Milestone</h5>
                  <button onClick={() => setActivePhaseIndex(null)} className="text-xs text-error font-bold hover:underline">Cancel</button>
                </div>
                <div>
                  <input
                    type="text"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Milestone title"
                    required
                  />
                </div>
                <div>
                  <textarea
                    value={mDesc}
                    onChange={(e) => setMDesc(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-textSecondary font-bold mb-1">Target Date</label>
                  <input
                    type="date"
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <button
                  onClick={() => handleAddMilestone(phaseIdx)}
                  className="w-full py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/90 transition-colors shadow-sm"
                >
                  Save Milestone
                </button>
              </div>
            )}

            <div className="space-y-3">
              {phase.milestones?.length === 0 ? (
                <p className="text-xs text-textSecondary italic">No milestones in this phase.</p>
              ) : (
                phase.milestones?.map((m) => (
                  <MilestoneCard
                    key={m.title}
                    milestone={m}
                    onStatusChange={handleStatusChange}
                    isEditable={isEditable}
                  />
                ))
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RoadmapSection;
