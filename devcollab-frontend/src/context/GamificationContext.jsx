import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const { setUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await API.get('/gamification/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('level_up', (data) => {
      toast.success(`⚡ LEVEL UP! You reached Level ${data.level}! Keep building!`, {
        duration: 5000,
        style: {
          border: '2px solid #7C3AED',
          padding: '16px',
          color: '#7C3AED',
          fontWeight: 'bold',
          background: '#F5F3FF',
        }
      });
    });

    socket.on('rank_up', (data) => {
      toast(`👑 RANK UP! You reached Rank: ${data.icon} ${data.rank}!`, {
        duration: 5000,
        style: {
          border: '2px solid #F59E0B',
          padding: '16px',
          color: '#D97706',
          fontWeight: 'bold',
          background: '#FEF3C7',
        }
      });
    });

    socket.on('new_badge', (data) => {
      toast(`🏆 BADGE EARNED: ${data.badgeDetails.icon} ${data.badgeName}!`, {
        duration: 5000,
        style: {
          border: '2px solid #10B981',
          padding: '16px',
          color: '#047857',
          fontWeight: 'bold',
          background: '#ECFDF5',
        }
      });
    });

    socket.on('points_update', (data) => {
      setUser(prev => {
        if (!prev) return null;
        // In user schema on backend, badges is an array. If points are updated, badges might also have been updated
        return {
          ...prev,
          points: data.points,
          level: data.level,
          rank: data.rank
        };
      });
      // Optionally trigger profile refetch to get updated badges
      API.get('/auth/profile').then(res => {
        setUser(res.data);
      }).catch(err => console.error(err));
    });

    return () => {
      socket.off('level_up');
      socket.off('rank_up');
      socket.off('new_badge');
      socket.off('points_update');
    };
  }, [socket, setUser]);

  return (
    <GamificationContext.Provider value={{ leaderboard, fetchLeaderboard, loadingLeaderboard }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext);
export default GamificationContext;
