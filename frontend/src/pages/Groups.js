import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Groups() {
  const { user, token, refreshUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isPlayful = theme === 'playful';

  const [group, setGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchGroup();
  }, [user]);

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${API}/groups/my-group`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroup(response.data);
    } catch (error) {
      console.error('Failed to fetch group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(
        `${API}/groups/create`,
        { name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroup(response.data);
      await refreshUser();
      toast.success('Group created successfully!');
      setGroupName('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!groupCode.trim()) {
      toast.error('Please enter a group code');
      return;
    }

    setJoining(true);
    try {
      const response = await axios.post(
        `${API}/groups/join`,
        { code: groupCode.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroup(response.data.group);
      await refreshUser();
      toast.success('Joined group successfully!');
      setGroupCode('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    toast.success('Group code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Groups</h1>
          <div className="w-10"></div>
        </div>

        {group ? (
          /* Current Group */
          <div>
            <div className={`bg-gradient-to-br from-primary to-accent p-6 mb-6 ${isPlayful ? 'rounded-[1.5rem] playful-shadow' : 'rounded-lg clean-shadow'}`}>
              <div className="text-white">
                <Users className="w-10 h-10 mb-3 opacity-90" />
                <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
                <p className="text-sm opacity-90 mb-4">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
                <div className="flex items-center gap-2">
                  <div className={`bg-white/20 px-4 py-2 ${isPlayful ? 'rounded-full' : 'rounded-md'} flex-1`}>
                    <p className="text-sm opacity-90 mb-1">Group Code</p>
                    <p className="text-xl font-bold tracking-wider">{group.code}</p>
                  </div>
                  <Button
                    onClick={handleCopyCode}
                    variant="secondary"
                    className={isPlayful ? 'rounded-full' : 'rounded-md'}
                    data-testid="copy-code-button"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}>
              <h3 className="text-lg font-bold mb-4">Share Your Group</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share the group code <span className="font-bold text-foreground">{group.code}</span> with family and friends so they can join your group!
              </p>
              <Button
                onClick={() => navigate('/leaderboard')}
                className={`w-full ${isPlayful ? 'rounded-full' : 'rounded-md'}`}
                data-testid="view-leaderboard-button"
              >
                View Leaderboard
              </Button>
            </div>
          </div>
        ) : (
          /* Create or Join Group */
          <div className="space-y-6">
            {/* Create Group */}
            <div className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}>
              <h2 className="text-xl font-bold mb-4">Create a Group</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Start a new group for your family or friends
              </p>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., Smith Family"
                    data-testid="group-name-input"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full ${isPlayful ? 'rounded-full' : 'rounded-md'}`}
                  disabled={creating}
                  data-testid="create-group-button"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </Button>
              </form>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Join Group */}
            <div className={`bg-card p-6 border ${isPlayful ? 'playful-border playful-shadow rounded-[1.5rem]' : 'clean-border clean-shadow rounded-lg'}`}>
              <h2 className="text-xl font-bold mb-4">Join a Group</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a group code to join an existing group
              </p>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <Label htmlFor="groupCode">Group Code</Label>
                  <Input
                    id="groupCode"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                    placeholder="Enter 8-character code"
                    data-testid="group-code-input"
                    maxLength={8}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full ${isPlayful ? 'rounded-full' : 'rounded-md'}`}
                  disabled={joining}
                  data-testid="join-group-button"
                >
                  {joining ? 'Joining...' : 'Join Group'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}