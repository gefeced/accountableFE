import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import confetti from 'canvas-confetti';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PET_CONFIGS = {
  'Mop Pet': {
    emoji: '🧹',
    message: 'Mop is cleaning up!',
    animation: 'bounce'
  },
  'Dumbbell Pet': {
    emoji: '🏋️',
    message: 'Dumbbell motivates you!',
    animation: 'pulse'
  },
  'Book Pet': {
    emoji: '📖',
    message: 'Book shares wisdom!',
    animation: 'float'
  },
  'Zen Stone Pet': {
    emoji: '🪨',
    message: 'Zen Stone brings peace!',
    animation: 'spin'
  },
  'Dove Pet': {
    emoji: '🕊️',
    message: 'Dove blesses you!',
    animation: 'fly'
  },
  'Chef Hat Pet': {
    emoji: '👨‍🍳',
    message: 'Chef inspires you!',
    animation: 'bounce'
  }
};

export default function PetAnimation() {
  const { user, token, refreshUser } = useAuth();
  const [activePet, setActivePet] = useState(null);
  const [activePetId, setActivePetId] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ownedPets, setOwnedPets] = useState([]);
  const timeoutRef = useRef(null);

  // Fetch owned pets with details
  useEffect(() => {
    if (!user || !token || !user.pets_owned || user.pets_owned.length === 0) return;

    const fetchOwnedPets = async () => {
      try {
        const response = await axios.get(`${API}/pets/owned`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOwnedPets(response.data.pets || []);
      } catch (error) {
        console.error('Failed to fetch owned pets:', error);
      }
    };

    fetchOwnedPets();
  }, [user, token]);

  // Show pet randomly
  const schedulePetAppearance = useCallback(() => {
    if (ownedPets.length === 0) return;

    const randomDelay = Math.random() * 120000 + 60000; // 1-3 minutes
    
    timeoutRef.current = setTimeout(() => {
      // Pick a random owned pet
      const randomPet = ownedPets[Math.floor(Math.random() * ownedPets.length)];
      const petConfig = Object.entries(PET_CONFIGS).find(([name]) => 
        randomPet.name.includes(name.split(' ')[0]) || name.includes(randomPet.name.split(' ')[0])
      );
      
      if (petConfig) {
        const randomX = Math.max(100, Math.min(window.innerWidth - 200, Math.random() * window.innerWidth));
        const randomY = Math.max(100, Math.min(window.innerHeight - 200, Math.random() * window.innerHeight));
        
        setPosition({ x: randomX, y: randomY });
        setActivePet(petConfig[0]);
        setActivePetId(randomPet.id);
        
        // Hide after 8 seconds if not clicked
        setTimeout(() => {
          setActivePet(null);
          setActivePetId(null);
        }, 8000);
      }
      
      schedulePetAppearance();
    }, randomDelay);
  }, [ownedPets]);

  useEffect(() => {
    if (ownedPets.length > 0) {
      schedulePetAppearance();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ownedPets, schedulePetAppearance]);

  const handlePetClick = async () => {
    if (!activePet || !user || !activePetId) return;

    const config = PET_CONFIGS[activePet];
    
    try {
      const response = await axios.post(
        `${API}/pets/interact`,
        { pet_id: activePetId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Mini confetti burst
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { 
            x: position.x / window.innerWidth, 
            y: position.y / window.innerHeight 
          }
        });
        
        toast.success(`${config.message} +${response.data.xp_awarded} XP!`, { duration: 3000 });
        await refreshUser();
      }
    } catch (error) {
      toast.error('Pet interaction failed');
      console.error('Failed to interact with pet:', error);
    }
    
    setActivePet(null);
    setActivePetId(null);
  };

  const getAnimation = (type) => {
    switch(type) {
      case 'bounce':
        return {
          y: [0, -20, 0],
          transition: { duration: 0.6, repeat: Infinity }
        };
      case 'pulse':
        return {
          scale: [1, 1.2, 1],
          transition: { duration: 0.8, repeat: Infinity }
        };
      case 'float':
        return {
          y: [0, -15, 0],
          x: [0, 10, 0],
          transition: { duration: 3, repeat: Infinity }
        };
      case 'spin':
        return {
          rotate: [0, 360],
          transition: { duration: 3, repeat: Infinity, ease: 'linear' }
        };
      case 'fly':
        return {
          y: [0, -30, 0],
          x: [0, 20, -20, 0],
          transition: { duration: 2, repeat: Infinity }
        };
      default:
        return {};
    }
  };

  if (!activePet) return null;

  const config = PET_CONFIGS[activePet];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed z-40 cursor-pointer"
        style={{ left: position.x, top: position.y }}
        onClick={handlePetClick}
        data-testid="pet-animation"
      >
        <motion.div
          animate={getAnimation(config.animation)}
          className="text-8xl filter drop-shadow-lg"
        >
          {config.emoji}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/80 text-white px-3 py-1 rounded-full text-sm"
        >
          Click me! ✨
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}