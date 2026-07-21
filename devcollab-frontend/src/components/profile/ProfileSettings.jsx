import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user.name || '');
  const [title, setTitle] = useState(user.title || '');
  const [location, setLocation] = useState(user.location || '');
  const [bio, setBio] = useState(user.bio || '');
  const [isAvailableForHire, setIsAvailableForHire] = useState(user.isAvailableForHire || false);
  const [availabilityStatus, setAvailabilityStatus] = useState(user.availabilityStatus || 'open');
  const [isPublic, setIsPublic] = useState(user.isPublic !== false);
  const [github, setGithub] = useState(user.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(user.socialLinks?.linkedin || '');
  const [twitter, setTwitter] = useState(user.socialLinks?.twitter || '');
  const [website, setWebsite] = useState(user.socialLinks?.website || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        title,
        location,
        bio,
        isAvailableForHire,
        availabilityStatus,
        socialLinks: { github, linkedin, twitter, website }
      });
      await API.patch('/profile/visibility', { isPublic });
      toast.success('Profile settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-border space-y-6">
      <h3 className="text-lg font-bold text-textPrimary">Profile Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Display Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Professional Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            placeholder="e.g. Lead Engineer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            placeholder="e.g. Austin, TX"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Availability Status</label>
          <select
            value={availabilityStatus}
            onChange={(e) => setAvailabilityStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
          >
            <option value="open">Open to collaborate</option>
            <option value="busy">Busy</option>
            <option value="not-looking">Not looking</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 p-4 bg-slate-50 border border-border rounded-xl">
          <input
            type="checkbox"
            id="isAvailable"
            checked={isAvailableForHire}
            onChange={(e) => setIsAvailableForHire(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="isAvailable" className="text-xs font-bold text-textPrimary">Available for hire</label>
        </div>

        <div className="flex items-center justify-between p-4 bg-violet-50/50 border border-violet-200/60 rounded-xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="isPublic" className="text-xs font-bold text-textPrimary">Public Shareable Portfolio</label>
          </div>
          {user.username && (
            <a
              href={`/portfolio/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-primary hover:underline"
            >
              View Portfolio ↗
            </a>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Short Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows="3"
          className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-none"
          placeholder="A short story about your developer journey..."
        />
      </div>

      <h4 className="text-sm font-bold text-textPrimary pt-4 border-t border-border">Social Profiles</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">GitHub Username</label>
          <input
            type="text"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            placeholder="username"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">LinkedIn Username</label>
          <input
            type="text"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            placeholder="username"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Twitter / X Username</label>
          <input
            type="text"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            placeholder="username"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Website URL</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50"
      >
        {saving ? 'Saving changes...' : 'Save Settings'}
      </button>
    </form>
  );
};

export default ProfileSettings;
