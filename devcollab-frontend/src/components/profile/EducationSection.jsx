import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import API from '../../services/api';

const EducationSection = () => {
  const { user, setUser } = useAuth();
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!institution || !degree) {
      return toast.error('Please enter all required fields');
    }

    setSaving(true);
    try {
      const newEdu = {
        institution,
        degree,
        field,
        startDate: startDate ? new Date(startDate) : null,
        endDate: isCurrent ? null : endDate ? new Date(endDate) : null,
        isCurrent
      };

      const updatedEdu = [...user.education, newEdu];
      const res = await API.put('/auth/profile', { education: updatedEdu });
      setUser(res.data);
      toast.success('Education added successfully!');
      
      setInstitution('');
      setDegree('');
      setField('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      setShowAddForm(false);
    } catch (err) {
      toast.error('Failed to add education');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEducation = async (id) => {
    setSaving(true);
    try {
      const updatedEdu = user.education.filter(e => e._id !== id);
      const res = await API.put('/auth/profile', { education: updatedEdu });
      setUser(res.data);
      toast.success('Education removed');
    } catch (err) {
      toast.error('Failed to remove education');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-textPrimary">Education</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold text-primary hover:underline focus:outline-none"
        >
          {showAddForm ? 'Cancel' : '+ Add Education'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEducation} className="space-y-4 mb-6 p-4 border border-border bg-slate-50 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Institution Name *</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                placeholder="Stanford University"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Degree / Qualification *</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                placeholder="Bachelor of Science (B.S.)"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Field of Study</label>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                placeholder="Computer Science"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs bg-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrentEdu"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="h-4 w-4 rounded border-border focus:ring-primary"
            />
            <label htmlFor="isCurrentEdu" className="text-xs text-textSecondary font-semibold">I currently study here</label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Education'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {user.education.length === 0 ? (
          <p className="text-xs text-textSecondary italic">No education details added yet.</p>
        ) : (
          user.education.map((edu) => (
            <div key={edu._id} className="relative pl-6 border-l-2 border-slate-100 pb-2">
              <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-secondary ring-4 ring-white" />
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-textPrimary">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</h4>
                  <p className="text-xs text-textSecondary font-semibold mt-0.5">{edu.institution}</p>
                  <p className="text-[10px] text-textSecondary mt-1">
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} -{' '}
                    {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(edu._id)}
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

export default EducationSection;
