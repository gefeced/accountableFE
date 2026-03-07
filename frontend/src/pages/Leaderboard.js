import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const periods = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'lifetime', label: 'All Time' }
];

export default function Leaderboard() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isPlayful = theme === 'playful';

  const [period, setPeriod] = useState('daily');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasGroup, setHasGroup] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    checkGroup();
  }, [user]);

  useEffect(() => {
    if (hasGroup) {
      fetchLeaderboard();
    }
  }, [period, hasGroup]);

  const checkGroup = async () => {
    try {
      const response = await axios.get(`${API}/groups/my-group`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasGroup(!!response.data);
    } catch (error) {
      console.error('Failed to check group:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/leaderboard/${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(response.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className={isPlayful ? 'rounded-full' : 'rounded-md'}
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <div className="w-10"></div>
        </div>

        {!hasGroup ? (
          <div className={`bg-card p-8 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'} text-center`}>
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Join a Group First</h2>
            <p className="text-muted-foreground mb-6">
              You need to create or join a group to see the leaderboard and compete with others!
            </p>
            <Button
              onClick={() => navigate('/groups')}
              className={isPlayful ? 'rounded-full' : 'rounded-md'}
              data-testid="join-group-button"
            >
              Go to Groups
            </Button>
          </div>
        ) : (
          <>
            {/* Period Tabs */}
            <Tabs value={period} onValueChange={setPeriod} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {periods.map((p) => (
                  <TabsTrigger key={p.id} value={p.id} data-testid={`tab-${p.id}`}>
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Leaderboard */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className={`bg-card p-8 border ${isPlayful ? 'playful-border rounded-[1.5rem]' : 'clean-border rounded-lg'} text-center`}>
                <p className="text-muted-foreground">No data available for this period</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.username === user.username;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={isPlayful ? { scale: 1.02 } : {}}
                      className={`bg-card p-4 border ${isPlayful ? 'playful-border rounded-[1.5rem]' : 'clean-border rounded-lg'} ${
                        isCurrentUser ? 'ring-2 ring-primary' : ''
                      }`}
                      data-testid={`leaderboard-entry-${index}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 flex items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${
                            isCurrentUser ? 'text-primary' : ''
                          }`}>
                            {entry.username}
                            {isCurrentUser && ' (You)'}
                          </p>
                          <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{entry.xp}</p>
                          <p className="text-xs text-muted-foreground">XP</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}