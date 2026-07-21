import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Avatar from '../components/common/Avatar';
import { toast } from 'react-hot-toast';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const portfolioRef = useRef(null);

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/portfolio/${username}`);
        setProfile(res.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Portfolio not found or set to private');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPublicPortfolio();
    }
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Portfolio link copied to clipboard!');
  };

  const handleDownloadPDF = async () => {
    if (!portfolioRef.current) return;
    toast.loading('Generating PDF...', { id: 'pdf' });
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = portfolioRef.current;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${username}-portfolio.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
      toast.success('Portfolio PDF downloaded!', { id: 'pdf' });
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error('Failed to export PDF', { id: 'pdf' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs font-bold text-textSecondary animate-pulse">Loading developer portfolio...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="bg-white border border-border p-8 rounded-3xl shadow-sm max-w-md w-full space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold text-textPrimary">Portfolio Unavailable</h2>
          <p className="text-xs text-textSecondary">{error || 'This developer profile is not publicly viewable.'}</p>
          <Link to="/" className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/95">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Action Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">Public Portfolio</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-textPrimary text-xs font-semibold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5"
            >
              📋 Copy Link
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              📥 Download as PDF
            </button>
          </div>
        </div>

        {/* Printable Portfolio Content Container */}
        <div ref={portfolioRef} className="bg-white border border-border rounded-3xl p-8 shadow-sm space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-border pb-8">
            <Avatar user={profile} size="2xl" />
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl font-extrabold text-textPrimary">{profile.name}</h1>
                <span className="px-3 py-1 bg-violet-100 text-violet-800 border border-violet-200 text-xs font-extrabold rounded-full">
                  ⚡ {profile.reliabilityScore?.score || 0}% Reliability
                </span>
              </div>
              <p className="text-xs text-textSecondary font-semibold">@{profile.username} • {profile.title || 'Developer'}</p>
              <p className="text-xs text-textSecondary">{profile.location || 'Remote Developer'}</p>
              
              {profile.bio && (
                <p className="text-xs text-textSecondary leading-relaxed pt-2 max-w-2xl">{profile.bio}</p>
              )}

              {/* Stats badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-3">
                <div className="px-3 py-1.5 bg-slate-50 border border-border rounded-xl text-center">
                  <span className="block text-[10px] text-textSecondary font-semibold">Rank & Level</span>
                  <span className="text-xs font-bold text-textPrimary">Level {profile.level || 1} ({profile.rank || 'Bronze'})</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 border border-border rounded-xl text-center">
                  <span className="block text-[10px] text-textSecondary font-semibold">Completed Projects</span>
                  <span className="text-xs font-bold text-emerald-600">{profile.completedProjectCount || 0} Finished</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 border border-border rounded-xl text-center">
                  <span className="block text-[10px] text-textSecondary font-semibold">Peer Rating</span>
                  <span className="text-xs font-bold text-amber-500">★ {profile.reliabilityScore?.peerRatingAvg || 5}/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-hoverColor border border-primary/15 rounded-xl text-xs font-bold text-primary">
                    {s.name} <span className="text-[10px] font-normal text-textSecondary">({s.level})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Projects Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Featured Portfolio Projects</h3>
            {(!profile.portfolio || profile.portfolio.length === 0) ? (
              <p className="text-xs text-textSecondary italic">No portfolio projects showcased yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.portfolio.map((proj, idx) => (
                  <div key={idx} className="p-5 border border-border bg-slate-50/50 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-textPrimary">{proj.title}</h4>
                      <p className="text-xs text-textSecondary leading-relaxed mt-1">{proj.description}</p>
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {proj.technologies.map((t, tidx) => (
                          <span key={tidx} className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-semibold text-textSecondary rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 pt-3 border-t border-slate-200 text-xs font-bold text-primary">
                      {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="hover:underline">Live Demo ↗</a>}
                      {proj.githubRepo && <a href={proj.githubRepo} target="_blank" rel="noreferrer" className="hover:underline">Repository ↗</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience Section */}
          {profile.experience && profile.experience.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Work Experience</h3>
              <div className="space-y-3">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-primary/30 pl-4 py-1 space-y-1">
                    <h4 className="text-sm font-bold text-textPrimary">{exp.position}</h4>
                    <p className="text-xs font-semibold text-textSecondary">{exp.company}</p>
                    {exp.description && <p className="text-xs text-textSecondary leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Earned */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Earned Badges</h3>
              <div className="flex flex-wrap gap-3">
                {profile.badges.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-border rounded-xl">
                    <span className="text-xl">{b.icon || '🏆'}</span>
                    <div>
                      <p className="text-xs font-bold text-textPrimary">{b.name}</p>
                      <p className="text-[10px] text-textSecondary">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicPortfolio;
