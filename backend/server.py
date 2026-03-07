from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore", arbitrary_types_allowed=True)
    id: str
    email: str
    username: str
    accountable_xp: int = 0
    accountable_level: int = 1
    coins: int = 0
    streak: int = 0
    last_active: str
    group_id: Optional[str] = None
    theme: str = "playful"
    chore_xp: int = 0
    chore_level: int = 1
    chore_coins: int = 0

class ChoreCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    duration: int

class Chore(BaseModel):
    model_config = ConfigDict(extra="ignore", arbitrary_types_allowed=True)
    id: str
    user_id: str
    title: str
    description: str
    xp_earned: int
    coins_earned: int
    chore_xp_earned: int
    chore_coins_earned: int
    duration: int
    completed_at: str

class ShopItem(BaseModel):
    model_config = ConfigDict(extra="ignore", arbitrary_types_allowed=True)
    id: str
    name: str
    type: str
    cost: int
    description: str
    image_url: Optional[str] = None

class PurchaseRequest(BaseModel):
    item_id: str

class GroupCreate(BaseModel):
    name: str

class GroupJoin(BaseModel):
    code: str

class Group(BaseModel):
    model_config = ConfigDict(extra="ignore", arbitrary_types_allowed=True)
    id: str
    name: str
    code: str
    created_by: str
    members: List[str]
    created_at: str

class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(extra="ignore", arbitrary_types_allowed=True)
    username: str
    xp: int
    level: int

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_level(xp: int) -> int:
    return max(1, int((xp / 100) ** 0.5) + 1)

def calculate_xp_for_duration(duration_seconds: int) -> int:
    return max(10, duration_seconds // 60)

# Auth routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "username": user_data.username,
        "password": hash_password(user_data.password),
        "accountable_xp": 0,
        "accountable_level": 1,
        "coins": 0,
        "streak": 0,
        "last_active": datetime.now(timezone.utc).isoformat(),
        "group_id": None,
        "theme": "playful",
        "chore_xp": 0,
        "chore_level": 1,
        "chore_coins": 0
    }
    
    await db.users.insert_one(user_doc)
    token = create_access_token({"sub": user_id})
    
    # Create clean user response without MongoDB ObjectId
    user_response = User(
        id=user_id,
        email=user_data.email,
        username=user_data.username,
        accountable_xp=0,
        accountable_level=1,
        coins=0,
        streak=0,
        last_active=datetime.now(timezone.utc).isoformat(),
        group_id=None,
        theme="playful",
        chore_xp=0,
        chore_level=1,
        chore_coins=0
    )
    return {"token": token, "user": user_response.model_dump()}

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"]})
    
    # Create clean user response
    user_response = User(**{k: v for k, v in user.items() if k != "password"})
    return {"token": token, "user": user_response.model_dump()}

# User routes
@api_router.get("/user/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.patch("/user/theme")
async def update_theme(theme: dict, current_user: User = Depends(get_current_user)):
    await db.users.update_one({"id": current_user.id}, {"$set": {"theme": theme["theme"]}})
    return {"success": True}

# Chore routes
@api_router.post("/chores", response_model=Chore)
async def create_chore(chore_data: ChoreCreate, current_user: User = Depends(get_current_user)):
    xp_earned = calculate_xp_for_duration(chore_data.duration)
    coins_earned = xp_earned // 2
    
    chore_id = str(uuid.uuid4())
    chore_doc = {
        "id": chore_id,
        "user_id": current_user.id,
        "title": chore_data.title,
        "description": chore_data.description,
        "xp_earned": xp_earned,
        "coins_earned": coins_earned,
        "chore_xp_earned": xp_earned,
        "chore_coins_earned": coins_earned,
        "duration": chore_data.duration,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.chores.insert_one(chore_doc)
    
    new_accountable_xp = current_user.accountable_xp + xp_earned
    new_coins = current_user.coins + coins_earned
    new_accountable_level = calculate_level(new_accountable_xp)
    
    new_chore_xp = current_user.chore_xp + xp_earned
    new_chore_coins = current_user.chore_coins + coins_earned
    new_chore_level = calculate_level(new_chore_xp)
    
    today = datetime.now(timezone.utc).date()
    last_active_date = datetime.fromisoformat(current_user.last_active).date()
    
    if (today - last_active_date).days == 1:
        new_streak = current_user.streak + 1
    elif today == last_active_date:
        new_streak = current_user.streak
    else:
        new_streak = 1
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "accountable_xp": new_accountable_xp,
            "accountable_level": new_accountable_level,
            "coins": new_coins,
            "chore_xp": new_chore_xp,
            "chore_coins": new_chore_coins,
            "chore_level": new_chore_level,
            "streak": new_streak,
            "last_active": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return Chore(**chore_doc)

@api_router.get("/chores", response_model=List[Chore])
async def get_chores(current_user: User = Depends(get_current_user)):
    chores = await db.chores.find({"user_id": current_user.id}, {"_id": 0}).sort("completed_at", -1).to_list(100)
    return chores

# Shop routes
@api_router.get("/shop/items", response_model=List[ShopItem])
async def get_shop_items():
    items = await db.shop_items.find({}, {"_id": 0}).to_list(100)
    if not items:
        default_items = [
            {"id": str(uuid.uuid4()), "name": "Double XP Boost", "type": "powerup", "cost": 50, "description": "2x XP for your next chore"},
            {"id": str(uuid.uuid4()), "name": "Coin Bonus", "type": "powerup", "cost": 30, "description": "Extra 20 coins for your next chore"},
            {"id": str(uuid.uuid4()), "name": "Streak Protection", "type": "powerup", "cost": 100, "description": "Protect your streak for 1 day"},
            {"id": str(uuid.uuid4()), "name": "Ocean Theme", "type": "theme", "cost": 150, "description": "Calming ocean color scheme"},
            {"id": str(uuid.uuid4()), "name": "Forest Background", "type": "background", "cost": 200, "description": "Beautiful forest scenery"}
        ]
        await db.shop_items.insert_many(default_items)
        items = default_items
    return items

@api_router.post("/shop/purchase")
async def purchase_item(purchase: PurchaseRequest, current_user: User = Depends(get_current_user)):
    item = await db.shop_items.find_one({"id": purchase.item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if current_user.chore_coins < item["cost"]:
        raise HTTPException(status_code=400, detail="Insufficient chore coins")
    
    inventory_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "item_id": purchase.item_id,
        "purchased_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_inventory.insert_one(inventory_doc)
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"chore_coins": current_user.chore_coins - item["cost"]}}
    )
    
    return {"success": True, "item": item}

# Group routes
@api_router.post("/groups/create", response_model=Group)
async def create_group(group_data: GroupCreate, current_user: User = Depends(get_current_user)):
    group_id = str(uuid.uuid4())
    group_code = str(uuid.uuid4())[:8].upper()
    
    group_doc = {
        "id": group_id,
        "name": group_data.name,
        "code": group_code,
        "created_by": current_user.id,
        "members": [current_user.id],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.groups.insert_one(group_doc)
    await db.users.update_one({"id": current_user.id}, {"$set": {"group_id": group_id}})
    
    return Group(**group_doc)

@api_router.post("/groups/join")
async def join_group(join_data: GroupJoin, current_user: User = Depends(get_current_user)):
    group = await db.groups.find_one({"code": join_data.code}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user.id in group["members"]:
        return {"success": True, "message": "Already a member"}
    
    await db.groups.update_one(
        {"id": group["id"]},
        {"$push": {"members": current_user.id}}
    )
    await db.users.update_one({"id": current_user.id}, {"$set": {"group_id": group["id"]}})
    
    return {"success": True, "group": group}

@api_router.get("/groups/my-group")
async def get_my_group(current_user: User = Depends(get_current_user)):
    if not current_user.group_id:
        return None
    
    group = await db.groups.find_one({"id": current_user.group_id}, {"_id": 0})
    return group

# Leaderboard routes
@api_router.get("/leaderboard/{period}", response_model=List[LeaderboardEntry])
async def get_leaderboard(period: str, current_user: User = Depends(get_current_user)):
    if not current_user.group_id:
        return []
    
    group = await db.groups.find_one({"id": current_user.group_id}, {"_id": 0})
    if not group:
        return []
    
    now = datetime.now(timezone.utc)
    
    if period == "daily":
        start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "weekly":
        start_time = now - timedelta(days=now.weekday())
        start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "monthly":
        start_time = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start_time = datetime.min.replace(tzinfo=timezone.utc)
    
    leaderboard = []
    
    for member_id in group["members"]:
        user = await db.users.find_one({"id": member_id}, {"_id": 0})
        if not user:
            continue
        
        if period == "lifetime":
            xp = user["accountable_xp"]
        else:
            chores = await db.chores.find({
                "user_id": member_id,
                "completed_at": {"$gte": start_time.isoformat()}
            }, {"_id": 0}).to_list(1000)
            xp = sum(chore["xp_earned"] for chore in chores)
        
        leaderboard.append({
            "username": user["username"],
            "xp": xp,
            "level": user["accountable_level"]
        })
    
    leaderboard.sort(key=lambda x: x["xp"], reverse=True)
    return leaderboard

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()