# Accountable - Gamified Lifestyle Tracker

## Product Overview
A mobile-style web app where users earn XP and coins by documenting activities across multiple life sectors. Features gamification elements like levels, achievements, pets, and shops.

## Core Features

### Implemented ✅

#### Authentication
- Email/password registration and login
- JWT-based authentication with 30-day tokens
- Profile management

#### Gamification System
- **Overall Accountable Level**: XP and progress bar
- **Total Coins**: Currency for main shop
- **Daily Streak**: Tracks consecutive days of activity

#### Sectors (6 Implemented)
- Chores, Fitness, Learning, Mind, Faith, Cooking
- Each sector has:
  - Individual XP, Level, and Coins
  - Activity timer (start/stop) and manual entry
  - Recent activities history
  - Dedicated shop

#### Shop System
- **Main Shop**: Trophies, badges, music player, music tracks
- **Sector Shops**: Pets, powerups, themes per sector
- **Preview Feature (P1)**: 
  - Costs 10 coins to preview any item
  - Lasts 2.5 minutes with countdown timer
  - Shows "Preview Active: X:XX" in green
  - Can repurchase preview or buy full item

#### Achievements System (P2)
- 9 achievements defined:
  - First Steps, Rising Star (Lv5), Dedicated (Lv10)
  - Week Warrior (7-day streak), Month Master (30-day streak)
  - Renaissance (all sectors), Wealthy (1000+ coins)
  - Pet Owner (first pet), Music Lover (music player)
- Automatic unlock detection after activities/purchases
- Confetti animation on new unlocks

#### Pet System (P2)
- 6 pet types (one per sector)
- Pets appear randomly (1-3 minutes) when owned
- Click pet for +5 XP bonus with confetti
- Different animations per pet type

#### Music Player
- Draggable, minimizable player component
- Available after purchase from main shop
- Play/pause/skip controls
- Volume slider

#### UI/UX
- Dual theme system (Playful/Clean)
- Confetti animations on level-ups
- Progress bars for XP
- Mobile-responsive design

### Groups & Leaderboards
- Create/join groups with invite codes
- Leaderboards: daily, weekly, monthly, lifetime

### Pocket Features
- **Games**: Chess, Tic-Tac-Toe
- **Tools**: Calculator, Advanced Calendar with events

## Technical Architecture

### Backend (FastAPI)
- `/app/backend/server.py` - Monolithic API server
- MongoDB with motor async driver
- JWT authentication
- Key endpoints:
  - `/api/auth/*` - Authentication
  - `/api/activities` - Activity logging
  - `/api/shop/*` - Shop and previews
  - `/api/pets/*` - Pet interactions
  - `/api/achievements` - Achievement tracking

### Frontend (React)
- `/app/frontend/src/App.js` - Router and layout
- Context providers: Auth, Theme
- Shadcn/UI components
- Framer Motion animations
- canvas-confetti for celebrations

### Database Schema (MongoDB)
- **users**: Profile, stats, inventory, achievements
- **activities**: Logged activities per sector
- **shop_items**: Available items per sector
- **user_inventory**: Purchased items
- **groups**: Family/team groups

## Recent Updates (December 2025)

### Session 1 - P1 Preview Feature
- Added `/api/shop/preview` endpoint (10 coins, 150 seconds)
- Added `/api/shop/previews` for active previews
- Updated MainShop.js and GenericSectorShop.js with preview UI
- Fixed MongoDB ObjectId serialization in register

### Session 2 - P2 Features
- Enhanced PetAnimation.js with backend integration
- Added `/api/pets/interact` for XP bonuses
- Added `/api/pets/owned` for pet details
- Enhanced Achievements page with unlock/locked sections
- Added confetti to achievements and pet interactions
- Added new achievements: Pet Owner, Music Lover

## Backlog (Future Tasks)

### P1 (High Priority)
- [ ] Full music player backend with actual audio files
- [ ] Powerup system implementation (2x XP, coin bonuses)

### P2 (Medium Priority)
- [ ] Real-time multiplayer pocket games
- [ ] Push notifications for streaks
- [ ] Profile picture upload feature

### P3 (Low Priority)
- [ ] Social features (friend lists, activity feed)
- [ ] Custom themes and backgrounds
- [ ] More pocket games (Checkers, etc.)

## Test Credentials
- Email: preview_test@example.com
- Password: test123

## Environment
- Preview URL: https://accountable-sectors.preview.emergentagent.com
- Frontend: React on port 3000
- Backend: FastAPI on port 8001
- Database: MongoDB
