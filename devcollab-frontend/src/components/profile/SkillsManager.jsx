import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import API from '../../services/api';

const SkillsManager = () => {
  const { user, setUser } = useAuth();
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [skillExp, setSkillExp] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillName) return toast.error('Please enter a skill name');
    
    const exists = user.skills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (exists) return toast.error('Skill already exists');

    setSaving(true);
    try {
      const updatedSkills = [...user.skills, { name: skillName, level: skillLevel, yearsOfExperience: Number(skillExp), isVerified: false }];
      const res = await API.put('/auth/profile', { skills: updatedSkills });
      setUser(res.data);
      toast.success('Skill added successfully! +10 XP');
      setSkillName('');
    } catch (err) {
      toast.error('Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (name) => {
    setSaving(true);
    try {
      const updatedSkills = user.skills.filter(s => s.name !== name);
      const res = await API.put('/auth/profile', { skills: updatedSkills });
      setUser(res.data);
      toast.success('Skill removed');
    } catch (err) {
      toast.error('Failed to remove skill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border">
      <h3 className="text-lg font-bold text-textPrimary mb-4">Manage Skills</h3>

      <div className="flex flex-wrap gap-2 mb-6">
        {user.skills.length === 0 ? (
          <p className="text-sm text-textSecondary italic">No skills added yet.</p>
        ) : (
          user.skills.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hoverColor text-primary font-semibold text-xs border border-primary/10">
              {s.name} ({s.level})
              <button
                type="button"
                disabled={saving}
                onClick={() => handleRemoveSkill(s.name)}
                className="text-error font-bold hover:scale-110 ml-1 focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))
        )}
      </div>

      <form onSubmit={handleAddSkill} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Skill Name</label>
            <input
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              placeholder="e.g. Docker"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Expertise Level</label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Years Exp.</label>
            <input
              type="number"
              min="0"
              value={skillExp}
              onChange={(e) => setSkillExp(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add Skill'}
        </button>
      </form>
    </div>
  );
};

export default SkillsManager;
