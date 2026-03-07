import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Sparkles, Coins, Flame, TrendingUp, Lock, Settings, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const sectors = [
  { id: 'chores', name: 'Chores', icon: '🧹', active: true },
  { id: 'fitness', name: 'Fitness', icon: '💪', active: false },
  { id: 'learning', name: 'Learning', icon: '📚', active: false },
  { id: 'cooking', name: 'Cooking', icon: '🍳', active: false },
  { id: 'mind', name: 'Mind', icon: '🧠', active: false },
  { id: 'faith', name: 'Faith', icon: '🙏', active: false }
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isPlayful = theme === 'playful';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const xpForNextLevel = Math.pow((user.accountable_level), 2) * 100;
  const xpProgress = (user.accountable_xp % xpForNextLevel) / xpForNextLevel * 100;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Welcome back,</h1>
            <p className="text-xl text-muted-foreground">{user.username}</p>
          </div>
          <motion.div
            animate={isPlayful ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* XP Card */}
          <motion.div
            whileHover={isPlayful ? { scale: 1.02 } : {}}
            className={`col-span-2 bg-gradient-to-br from-primary to-accent p-6 ${isPlayful ? 'rounded-[1.5rem] playful-shadow' : 'rounded-lg clean-shadow'}`}
            data-testid="xp-card"
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Total Accountable XP</p>
                <p className="text-4xl font-bold">{user.accountable_xp}</p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </motion.div>

          {/* Level Card */}
          <div className={`col-span-2 bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`} data-testid="level-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Accountable Level</p>
              <p className="text-2xl font-bold">Level {user.accountable_level}</p>
            </div>
            <Progress value={xpProgress} className="h-4" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.floor(xpProgress)}% to Level {user.accountable_level + 1}
            </p>
          </div>

          {/* Coins Card */}
          <motion.div
            whileHover={isPlayful ? { scale: 1.05 } : {}}
            className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}
            data-testid="coins-card"
          >
            <Coins className="w-8 h-8 text-accent mb-2" />
            <p className="text-sm text-muted-foreground">Coins</p>
            <p className="text-2xl font-bold">{user.coins}</p>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            whileHover={isPlayful ? { scale: 1.05 } : {}}
            className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}
            data-testid="streak-card"
          >
            <Flame className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold">{user.streak} days</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/leaderboard')}
            className={`flex-1 ${isPlayful ? 'rounded-full' : 'rounded-md'}`}
            variant="outline"
            data-testid="leaderboard-button"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
          <Button
            onClick={() => navigate('/settings')}
            className={`flex-1 ${isPlayful ? 'rounded-full' : 'rounded-md'}`}
            variant="outline"
            data-testid="settings-button"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Sectors */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Sectors</h2>
          <div className="grid grid-cols-2 gap-4">
            {sectors.map((sector) => (
              <motion.div
                key={sector.id}
                whileHover={sector.active && isPlayful ? { scale: 1.05 } : {}}
                whileTap={sector.active ? { scale: 0.95 } : {}}
                onClick={() => sector.active && navigate(`/sector/${sector.id}`)}
                className={`relative bg-card p-6 border cursor-pointer transition-all ${
                  isPlayful ? 'rounded-[1.5rem] playful-border' : 'rounded-lg clean-border'
                } ${
                  sector.active
                    ? isPlayful ? 'playful-shadow hover:shadow-lg' : 'clean-shadow hover:shadow-md'
                    : 'opacity-50 cursor-not-allowed grayscale'
                }`}
                data-testid={`sector-${sector.id}`}
              >
                {!sector.active && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="text-4xl mb-2">{sector.icon}</div>
                <p className="font-bold text-lg">{sector.name}</p>
                {!sector.active && (
                  <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pocket Games */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pocket Games</h2>
          <div className={`bg-card p-8 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'} text-center`}>
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Fun mini-games to earn extra XP and coins will be available here soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}