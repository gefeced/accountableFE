import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Achievements() {
  const { user, token, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isPlayful = theme === 'playful';
  const [achievements, setAchievements] = useState({ unlocked: [], all: [] });
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [previousUnlocked, setPreviousUnlocked] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchAchievements();
    }
  }, [user, loading]);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get(`${API}/achievements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check for newly unlocked achievements
      const newlyUnlocked = response.data.unlocked.filter(
        id => !previousUnlocked.includes(id)
      );
      
      if (newlyUnlocked.length > 0 && previousUnlocked.length > 0) {
        // Trigger confetti for new achievements
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      setPreviousUnlocked(response.data.unlocked);
      setAchievements(response.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoadingAchievements(false);
    }
  };

  if (loading || loadingAchievements || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const unlockedCount = achievements.unlocked.length;
  const totalCount = achievements.all.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

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
          <h1 className="text-3xl font-bold">Achievements</h1>
          <div className="w-10"></div>
        </div>

        {/* Stats Card */}
        <div className={`bg-primary p-6 ${isPlayful ? 'rounded-[1.5rem] playful-shadow' : 'rounded-lg clean-shadow'}`}>
          <div className="flex items-center justify-between text-primary-foreground mb-4">
            <div>
              <p className="text-sm opacity-90">Achievements Unlocked</p>
              <p className="text-4xl font-bold">
                {unlockedCount} / {totalCount}
              </p>
            </div>
            <Trophy className="w-12 h-12 opacity-80" />
          </div>
          <Progress value={progressPercent} className="h-3 bg-primary-foreground/30" />
          <p className="text-xs text-primary-foreground/80 mt-2">
            {Math.round(progressPercent)}% Complete
          </p>
        </div>

        {/* Unlocked Achievements */}
        {achievements.unlocked.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Unlocked
            </h2>
            <div className="space-y-4">
              {achievements.all
                .filter(a => achievements.unlocked.includes(a.id))
                .map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-card p-6 border-2 border-primary ${isPlayful ? 'rounded-[1.5rem]' : 'rounded-lg'}`}
                    data-testid={`achievement-${achievement.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">{achievement.name}</h3>
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            Unlocked
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Locked
          </h2>
          <div className="space-y-4">
            {achievements.all
              .filter(a => !achievements.unlocked.includes(a.id))
              .map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card p-6 border opacity-60 ${isPlayful ? 'rounded-[1.5rem]' : 'rounded-lg'}`}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl grayscale">🔒</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}