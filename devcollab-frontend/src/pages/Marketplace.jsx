import React, { useState, useEffect } from 'react';
import DeveloperCard from '../components/marketplace/DeveloperCard';
import DeveloperProfilePublic from '../components/marketplace/DeveloperProfilePublic';
import CollaborationRequestModal from '../components/marketplace/CollaborationRequestModal';
import API from '../services/api';

const Marketplace = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [availability, setAvailability] = useState('');

  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [inviteDeveloper, setInviteDeveloper] = useState(null);

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (skill) params.skill = skill;
      if (availability) params.availability = availability;

      const res = await API.get('/marketplace/developers', { params });
      setDevelopers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDevelopers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, skill, availability]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-textPrimary">Developer Marketplace</h2>
        <p className="text-xs text-textSecondary mt-1">Search for skilled programmers, inspect portfolios, and invite them to collaborate.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-border p-4 rounded-2xl shadow-sm">
        <div>
          <label className="block text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1.5">Search by name / title</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
            placeholder="e.g. Backend Dev"
          />
        </div>
        <div>
          <label className="block text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1.5">Filter by Skill</label>
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
            placeholder="e.g. Docker"
          />
        </div>
        <div>
          <label className="block text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1.5">Availability Status</label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs bg-white"
          >
            <option value="">All Availabilities</option>
            <option value="open">Available to join (Open)</option>
            <option value="busy">Busy on other projects</option>
            <option value="not-looking">Not looking</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-border rounded-2xl p-6 h-56 animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : developers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-border">
          <span className="text-4xl">👥</span>
          <h3 className="text-lg font-bold text-textPrimary mt-4">No developers found</h3>
          <p className="text-sm text-textSecondary mt-2">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((dev) => (
            <DeveloperCard
              key={dev._id || dev.id}
              developer={dev}
              onViewProfile={setSelectedDeveloper}
              onInvite={setInviteDeveloper}
            />
          ))}
        </div>
      )}

      {selectedDeveloper && (
        <DeveloperProfilePublic
          developer={selectedDeveloper}
          onClose={() => setSelectedDeveloper(null)}
        />
      )}

      {inviteDeveloper && (
        <CollaborationRequestModal
          developer={inviteDeveloper}
          onClose={() => setInviteDeveloper(null)}
        />
      )}
    </div>
  );
};

export default Marketplace;
