import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Palette, User } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Settings() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isPlayful = theme === 'playful';

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleThemeToggle = async () => {
    const newTheme = theme === 'playful' ? 'clean' : 'playful';
    toggleTheme();
    try {
      await axios.patch(
        `${API}/user/theme`,
        { theme: newTheme },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

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
          <h1 className="text-3xl font-bold">Settings</h1>
          <div className="w-10"></div>
        </div>

        {/* Profile Section */}
        <div className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold ${
              isPlayful ? 'playful-shadow' : 'clean-shadow'
            }`}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-2xl font-bold">{user.accountable_level}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total XP</p>
              <p className="text-2xl font-bold">{user.accountable_xp}</p>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme-toggle" className="text-base font-semibold cursor-pointer">
                  Theme Mode
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {isPlayful ? 'Playful & Energetic' : 'Clean & Minimal'}
                </p>
              </div>
              <Switch
                id="theme-toggle"
                checked={isPlayful}
                onCheckedChange={handleThemeToggle}
                data-testid="theme-toggle"
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-3">Preview</p>
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 border text-center cursor-pointer ${
                    isPlayful
                      ? 'bg-primary text-white rounded-[1.5rem] playful-border playful-shadow'
                      : 'bg-secondary rounded-lg clean-border'
                  }`}
                  onClick={() => !isPlayful && handleThemeToggle()}
                  data-testid="playful-preview"
                >
                  <p className="font-bold">Playful</p>
                  {isPlayful && <p className="text-xs mt-1">Active</p>}
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 border text-center cursor-pointer ${
                    !isPlayful
                      ? 'bg-primary text-white rounded-lg clean-border clean-shadow'
                      : 'bg-secondary rounded-[1.5rem] playful-border'
                  }`}
                  onClick={() => isPlayful && handleThemeToggle()}
                  data-testid="clean-preview"
                >
                  <p className="font-bold">Clean</p>
                  {!isPlayful && <p className="text-xs mt-1">Active</p>}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}>
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/groups')}
              variant="outline"
              className={`w-full justify-start ${isPlayful ? 'rounded-full' : 'rounded-md'}`}
              data-testid="groups-link"
            >
              <User className="w-4 h-4 mr-2" />
              Manage Groups
            </Button>
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className={`w-full ${isPlayful ? 'rounded-full' : 'rounded-md'}`}
          data-testid="logout-button"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}