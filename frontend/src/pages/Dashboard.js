import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, Flame, TrendingUp, Lock, Settings, Trophy, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const sectors = [
  { id: 'chores', name: 'Chores', icon: '🧹', active: true },
  { id: 'fitness', name: 'Fitness', icon: '💪', active: true },
  { id: 'learning', name: 'Learning', icon: '📚', active: true },
  { id: 'cooking', name: 'Cooking', icon: '🍳', active: true },
  { id: 'mind', name: 'Mind', icon: '🧠', active: true },
  { id: 'faith', name: 'Faith', icon: '🙏', active: true }
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isPlayful = theme === 'playful';
  const [coinsExpanded, setCoinsExpanded] = useState(false);

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
            className={`col-span-2 bg-primary p-6 ${isPlayful ? 'rounded-[1.5rem] playful-shadow' : 'rounded-lg clean-shadow'}`}
            data-testid="xp-card"
          >
            <div className="flex items-center justify-between text-primary-foreground">
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

          {/* Coins Card with Expandable Breakdown */}
          <motion.div
            whileHover={isPlayful ? { scale: 1.05 } : {}}
            className={`col-span-2 bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}
            data-testid="coins-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Coins className="w-10 h-10 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Coins</p>
                  <p className="text-3xl font-bold text-foreground">{user.coins}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCoinsExpanded(!coinsExpanded)}
                className={isPlayful ? 'rounded-full' : 'rounded-md'}
                data-testid="expand-coins-button"
              >
                {coinsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
            
            <AnimatePresence>
              {coinsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t space-y-3 overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Chore Coins</span>
                    <span className="text-lg font-bold text-foreground">{user.chores_coins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fitness Coins</span>
                    <span className="text-lg font-bold text-foreground">{user.fitness_coins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Learning Coins</span>
                    <span className="text-lg font-bold text-foreground">{user.learning_coins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cooking Coins</span>
                    <span className="text-lg font-bold text-foreground">{user.cooking_coins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mind Coins</span>
                    <span className="text-lg font-bold text-foreground">{user.mind_coins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Faith Coins</span>
                    <span className="text-lg font-bold text-foreground">{user.faith_coins}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            whileHover={isPlayful ? { scale: 1.05 } : {}}
            className={`col-span-2 bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}
            data-testid="streak-card"
          >
            <Flame className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-sm text-muted-foreground">Daily Streak</p>
            <p className="text-2xl font-bold text-foreground">{user.streak} days</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => navigate('/leaderboard')}
            className={`${isPlayful ? 'rounded-full' : 'rounded-md'}`}
            variant="outline"
            data-testid="leaderboard-button"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
          <Button
            onClick={() => navigate('/achievements')}
            className={`${isPlayful ? 'rounded-full' : 'rounded-md'}`}
            variant="outline"
            data-testid="achievements-button"
          >
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </Button>
          <Button
            onClick={() => navigate('/settings')}
            className={`${isPlayful ? 'rounded-full' : 'rounded-md'}`}
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

        {/* Pocket Tools */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pocket Accountable Tools</h2>
          <motion.div
            whileHover={isPlayful ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tools')}
            className={`bg-card p-8 border cursor-pointer ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'} text-center hover:bg-secondary/50 transition-colors`}
            data-testid="pocket-tools"
          >
            <div className="text-5xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold mb-2">Calendar & Calculator</h3>
            <p className="text-muted-foreground">
              Plan your schedule and use handy tools!
            </p>
          </motion.div>
        </div>

        {/* Pocket Games */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pocket Games</h2>
          <motion.div
            whileHover={isPlayful ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/games')}
            className={`bg-card p-8 border cursor-pointer ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'} text-center hover:bg-secondary/50 transition-colors`}
            data-testid="pocket-games"
          >
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2">Chess, Tic-Tac-Toe & More</h3>
            <p className="text-muted-foreground">
              Play fun mini-games to earn coins!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}