import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const OnboardingModal = () => {
  const { user, updateProfile, completeOnboarding, updateOnboardingStep } = useAuth();

  if (!user || user.onboardingCompleted) return null;

  const currentStep = user.onboardingStep || 1;
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(user.title || '');
  const [location, setLocation] = useState(user.location || '');
  const [bio, setBio] = useState(user.bio || '');

  const [skills, setSkills] = useState(user.skills || []);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [skillExp, setSkillExp] = useState(1);

  const [isAvailableForHire, setIsAvailableForHire] = useState(user.isAvailableForHire || false);
  const [availabilityStatus, setAvailabilityStatus] = useState(user.availabilityStatus || 'open');

  const [github, setGithub] = useState(user.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(user.socialLinks?.linkedin || '');

  const [workingStyle, setWorkingStyle] = useState(user.workingStyle || []);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (currentStep === 1) {
        await updateOnboardingStep(2);
      } else if (currentStep === 2) {
        if (!title || !location || !bio) {
          toast.error('Please fill in title, location, and bio');
          setLoading(false);
          return;
        }
        await updateProfile({ title, location, bio });
        await updateOnboardingStep(3);
      } else if (currentStep === 3) {
        if (skills.length < 3) {
          toast.error('Please add at least 3 skills to showcase your expertise!');
          setLoading(false);
          return;
        }
        await updateProfile({ skills });
        await updateOnboardingStep(4);
      } else if (currentStep === 4) {
        await updateProfile({ isAvailableForHire, availabilityStatus, workingStyle });
        await updateOnboardingStep(5);
      } else if (currentStep === 5) {
        await updateProfile({
          socialLinks: { github, linkedin, twitter: '', website: '' }
        });
        await updateOnboardingStep(6);
      } else if (currentStep === 6) {
        await updateOnboardingStep(7);
      } else if (currentStep === 7) {
        await completeOnboarding();
        toast.success('Onboarding complete! Profile Complete badge awarded!');
      }
    } catch (err) {
      toast.error('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!skillName) return toast.error('Please enter a skill name');
    if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      return toast.error('Skill already added');
    }
    const newSkill = { name: skillName, level: skillLevel, yearsOfExperience: Number(skillExp), isVerified: false };
    setSkills([...skills, newSkill]);
    setSkillName('');
  };

  const handleRemoveSkill = (name) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-border shadow-2xl p-8 relative overflow-hidden transition-all duration-300">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <span
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${s === currentStep ? 'w-8 bg-primary' : s < currentStep ? 'w-2 bg-success' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-textSecondary bg-slate-100 px-2.5 py-1 rounded-lg">Step {currentStep} of 7</span>
        </div>

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-textPrimary text-center">👋 Welcome to DevCollab!</h2>
            <p className="text-sm text-textSecondary text-center leading-relaxed">
              Connect with developers, join project teams, and build amazing products together. Let's configure your profile to get you started!
            </p>
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-3 mt-4">
              <span className="text-xl">🏆</span>
              <p className="text-xs text-primary leading-relaxed font-semibold">
                Tip: Complete all onboarding tasks to unlock your first profile points and earn the "Profile Complete" achievement badge!
              </p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-textPrimary">Create Your Profile</h2>
            <p className="text-xs text-textSecondary mb-4">Add your professional title and location to let others know who you are.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase mb-1">Professional Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                  placeholder="e.g. Frontend React Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                  placeholder="e.g. San Francisco, CA"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase mb-1">Short Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm resize-none"
                  placeholder="Tell the community about your passions and coding stack..."
                  required
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-textPrimary">Add Your Skills</h2>
            <p className="text-xs text-textSecondary">Showcase your technical expertise. Add at least 3 skills to proceed.</p>

            <div className="flex flex-wrap gap-2 py-2 max-h-24 overflow-y-auto border-b border-border mb-3">
              {skills.length === 0 ? (
                <span className="text-xs text-textSecondary italic">No skills added yet.</span>
              ) : (
                skills.map((s) => (
                  <span key={s.name} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-hoverColor text-primary font-semibold text-xs border border-primary/10">
                    {s.name} ({s.level})
                    <button onClick={() => handleRemoveSkill(s.name)} className="text-error font-bold hover:scale-110 ml-1">x</button>
                  </span>
                ))
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
                  placeholder="Skill name (e.g. JavaScript)"
                />
              </div>
              <div>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-textSecondary font-semibold">Years Exp:</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={skillExp}
                  onChange={(e) => setSkillExp(e.target.value)}
                  className="w-16 px-2 py-1 rounded border border-border text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/90 transition-colors"
              >
                + Add Skill
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-textPrimary">Set Availability</h2>
            <p className="text-xs text-textSecondary mb-4">Let project owners search for you in the developer marketplace.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-border rounded-2xl">
                <div>
                  <h4 className="text-sm font-semibold text-textPrimary">Available for Hire</h4>
                  <p className="text-xs text-textSecondary">Show a "For Hire" badge on your cards</p>
                </div>
                <input
                  type="checkbox"
                  checked={isAvailableForHire}
                  onChange={(e) => setIsAvailableForHire(e.target.checked)}
                  className="h-5 w-5 text-primary rounded border-border focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase mb-1">Availability Status</label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                >
                  <option value="open">Open to collaborate (Open)</option>
                  <option value="busy">Busy on other projects (Busy)</option>
                  <option value="not-looking">Not looking for projects (Not looking)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase mb-1.5">Working Style Preference</label>
                <div className="flex flex-wrap gap-2">
                  {['Async-first', 'Daily standups', 'Weekend availability', 'Night owl'].map((style) => {
                    const isSelected = workingStyle.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setWorkingStyle(workingStyle.filter(s => s !== style));
                          } else {
                            setWorkingStyle([...workingStyle, style]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-slate-50 border-border text-textSecondary hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{style}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-textPrimary">Connect Social Links</h2>
            <p className="text-xs text-textSecondary mb-4">Provide links to establish community trust.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase mb-1">GitHub Username</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-slate-50 text-textSecondary text-xs">github.com/</span>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 rounded-r-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase mb-1">LinkedIn Username</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-slate-50 text-textSecondary text-xs">linkedin.com/in/</span>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 rounded-r-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-textPrimary text-center">📂 Explore Projects</h2>
            <p className="text-sm text-textSecondary text-center leading-relaxed">
              Now that your profile setup is complete, you can find projects that fit your skill level or create a new project of your own!
            </p>
            <div className="p-4 bg-slate-50 border border-border rounded-2xl space-y-2 mt-4 text-xs text-textSecondary font-medium">
              <p className="font-semibold text-textPrimary">Here is how to get started:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Visit the **Projects** tab to browse project join requests.</li>
                <li>Visit the **Marketplace** to find other developers.</li>
                <li>Earn XP by completing tasks and milestone roadmaps.</li>
              </ul>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-textPrimary">🎉 You're Ready!</h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              Your onboarding setup is fully finished. Click the button below to join the community, collect your XP, and start building!
            </p>
            <div className="text-6xl my-4 animate-bounce">🏆</div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : currentStep === 7 ? 'Complete Setup' : 'Next Step'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
