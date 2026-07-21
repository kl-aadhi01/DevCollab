import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import API from '../../services/api';

const ExperienceSection = () => {
  const { user, setUser } = useAuth();
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!company || !position || !startDate) {
      return toast.error('Please enter all required fields');
    }

    setSaving(true);
    try {
      const newExp = {
        company,
        position,
        startDate: new Date(startDate),
        endDate: isCurrent ? null : endDate ? new Date(endDate) : null,
        isCurrent,
        description,
        technologies: []
      };

      const updatedExp = [...user.experience, newExp];
      const res = await API.put('/auth/profile', { experience: updatedExp });
      setUser(res.data);
      toast.success('Experience added successfully!');
      
      setCompany('');
      setPosition('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      setDescription('');
      setShowAddForm(false);
    } catch (err) {
      toast.error('Failed to add experience');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExperience = async (id) => {
    setSaving(true);
    try {
      const updatedExp = user.experience.filter(e => e._id !== id);
      const res = await API.put('/auth/profile', { experience: updatedExp });
      setUser(res.data);
      toast.success('Experience removed');
    } catch (err) {
      toast.error('Failed to remove experience');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-textPrimary">Work Experience</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold text-primary hover:underline focus:outline-none"
        >
          {showAddForm ? 'Cancel' : '+ Add Experience'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddExperience} className="space-y-4 mb-6 p-4 border border-border bg-slate-50 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                placeholder="Google"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Position / Role *</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                placeholder="Software Engineer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isCurrent}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="h-4 w-4 rounded border-border focus:ring-primary"
            />
            <label htmlFor="isCurrent" className="text-xs text-textSecondary font-semibold">I currently work here</label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white resize-none"
              placeholder="Describe your achievements and key tech stack..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Experience'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {user.experience.length === 0 ? (
          <p className="text-xs text-textSecondary italic">No experience added yet.</p>
        ) : (
          user.experience.map((exp) => (
            <div key={exp._id} className="relative pl-6 border-l-2 border-slate-100 pb-2">
              <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-white" />
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-textPrimary">{exp.position}</h4>
                  <p className="text-xs text-textSecondary font-semibold mt-0.5">{exp.company}</p>
                  <p className="text-[10px] text-textSecondary mt-1">
                    {new Date(exp.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' })} -{' '}
                    {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                  {exp.description && <p className="text-xs text-textSecondary mt-2 leading-relaxed">{exp.description}</p>}
                </div>
                <button
                  onClick={() => handleRemoveExperience(exp._id)}
                  disabled={saving}
                  className="text-[10px] text-error font-medium hover:underline focus:outline-none"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExperienceSection;
