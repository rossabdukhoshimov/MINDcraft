from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mindcraft.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.relationship('PlayerProgress', backref='user', uselist=False)
    inventory = db.relationship('PlayerInventory', backref='user', uselist=False)

    def __repr__(self):
        return f'<User {self.username}>'

class PlayerProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    level = db.Column(db.Integer, default=1)
    xp = db.Column(db.Integer, default=0)
    coins = db.Column(db.Integer, default=0)
    current_stage = db.Column(db.Integer, default=1)
    unlocked_areas = db.Column(db.Text, default='[]')  # JSON array
    achievements = db.Column(db.Text, default='[]')  # JSON array
    high_scores = db.Column(db.Text, default='{}')  # JSON object
    best_times = db.Column(db.Text, default='{}')  # JSON object
    last_save = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<PlayerProgress {self.user_id}>'

class PlayerInventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    items = db.Column(db.Text, default='{}')  # JSON object of item_id: quantity
    home_decorations = db.Column(db.Text, default='[]')  # JSON array of placed decorations
    character_cards = db.Column(db.Text, default='{}')  # JSON object of character progress {character_id: progress_count}
    unlocked_characters = db.Column(db.Text, default='[]')  # JSON array of fully unlocked character IDs
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<PlayerInventory {self.user_id}>'

# Game Data
MINECRAFT_CHARACTERS = {
    "steve": {
        "name": "Steve",
        "description": "The classic Minecraft hero",
        "rarity": "common",
        "category": "heroes",
        "image": "/images/characters/steve.png"
    },
    "steve_on_horse": {
        "name": "Steve on Horse",
        "description": "The mounted adventurer",
        "rarity": "rare",
        "category": "heroes",
        "image": "/images/characters/steve_on_horse.png"
    },
    "creeper": {
        "name": "Creeper",
        "description": "The explosive green monster",
        "rarity": "rare",
        "category": "mobs",
        "image": "/images/characters/creeper.png"
    },
    "big_creeper": {
        "name": "Big Creeper",
        "description": "The giant explosive menace",
        "rarity": "legendary",
        "category": "mobs",
        "image": "/images/characters/big_creeper.png"
    },
    "enderman": {
        "name": "Enderman",
        "description": "The mysterious teleporter",
        "rarity": "rare",
        "category": "mobs", 
        "image": "/images/characters/endermen.png"
    },
    "zombie": {
        "name": "Zombie",
        "description": "The undead wanderer",
        "rarity": "common",
        "category": "mobs",
        "image": "/images/characters/zombie.png"
    },
    "spider": {
        "name": "Spider",
        "description": "The eight-legged crawler",
        "rarity": "common",
        "category": "mobs",
        "image": "/images/characters/spider.png"
    },
    "pig": {
        "name": "Pig",
        "description": "The pink farm friend",
        "rarity": "common",
        "category": "animals",
        "image": "/images/characters/pig.png"
    },
    "wolf": {
        "name": "Wolf",
        "description": "The loyal companion",
        "rarity": "rare",
        "category": "animals",
        "image": "/images/characters/wolf.png"
    },
    "llama": {
        "name": "Llama",
        "description": "The desert traveler",
        "rarity": "common",
        "category": "animals",
        "image": "/images/characters/llama.png"
    },
    "bird": {
        "name": "Bird",
        "description": "The flying friend",
        "rarity": "common",
        "category": "animals",
        "image": "/images/characters/bird.png"
    },
    "villager": {
        "name": "Villager",
        "description": "The friendly trader",
        "rarity": "common",
        "category": "villagers",
        "image": "/images/characters/villager.png"
    },
    "robin_hood": {
        "name": "Robin Hood",
        "description": "The legendary archer",
        "rarity": "legendary",
        "category": "heroes",
        "image": "/images/characters/robin_hood.png"
    },
    "robin": {
        "name": "Robin",
        "description": "The skilled archer",
        "rarity": "rare",
        "category": "heroes",
        "image": "/images/characters/Robin.png"
    },
    "fighter": {
        "name": "Fighter",
        "description": "The brave warrior",
        "rarity": "rare",
        "category": "heroes",
        "image": "/images/characters/fighter.png"
    },
    "swordguy": {
        "name": "Sword Guy",
        "description": "The master swordsman",
        "rarity": "legendary",
        "category": "heroes",
        "image": "/images/characters/swordguy.png"
    },
    "dynamite_guy": {
        "name": "Dynamite Guy",
        "description": "The explosive expert",
        "rarity": "rare",
        "category": "heroes",
        "image": "/images/characters/Dynamite_guy.png"
    },
    "teamwork": {
        "name": "Teamwork",
        "description": "The cooperative spirit",
        "rarity": "legendary",
        "category": "heroes",
        "image": "/images/characters/teamwork.png"
    },
    "minecraft_realms": {
        "name": "Minecraft Realms",
        "description": "The realm guardian",
        "rarity": "legendary",
        "category": "heroes",
        "image": "/images/characters/minecraft-realms-minecraft-6.png"
    }
}

STAGES = {
    1: {
        "name": "Number Woods",
        "theme": "Addition & Subtraction Basics",
        "description": "Solve math problems to chop trees and collect coins",
        "emoji": "🌲",
        "challenges": ["math_trees", "sight_words"],
        "xp_required": 0
    },
    2: {
        "name": "Word Village", 
        "theme": "Reading Comprehension & Vocabulary",
        "description": "Help villagers by choosing correct words and solving problems",
        "emoji": "🏘️",
        "challenges": ["reading_villagers", "math_gates"],
        "xp_required": 100
    },
    3: {
        "name": "Fraction Caves",
        "theme": "Fractions & Multiplication", 
        "description": "Break blocks matching fractions and read cave stories",
        "emoji": "⛏️",
        "challenges": ["fraction_blocks", "cave_stories"],
        "xp_required": 250
    },
    4: {
        "name": "The Sky Tower",
        "theme": "Mixed Challenges & Timed Puzzles",
        "description": "Climb platforms by answering math and reading questions",
        "emoji": "☁️",
        "challenges": ["mixed_puzzles", "timed_climbing"],
        "xp_required": 500
    }
}

MATH_PROBLEMS = {
    "easy": [
        {"question": "2 + 3 = ?", "answer": 5, "type": "addition"},
        {"question": "7 - 4 = ?", "answer": 3, "type": "subtraction"},
        {"question": "5 + 2 = ?", "answer": 7, "type": "addition"},
        {"question": "9 - 3 = ?", "answer": 6, "type": "subtraction"},
        {"question": "4 + 6 = ?", "answer": 10, "type": "addition"},
        {"question": "3 + 1 = ?", "answer": 4, "type": "addition"},
        {"question": "8 - 2 = ?", "answer": 6, "type": "subtraction"},
        {"question": "1 + 1 = ?", "answer": 2, "type": "addition"},
        {"question": "6 - 1 = ?", "answer": 5, "type": "subtraction"},
        {"question": "0 + 5 = ?", "answer": 5, "type": "addition"},
        {"question": "If you have 2 cats and 3 dogs, how many pets do you have?", "answer": 5, "type": "addition"},
        {"question": "If 4 birds are on a tree and 2 fly away, how many are left?", "answer": 2, "type": "subtraction"},
        {"question": "If you see 3 rabbits and 2 more join them, how many rabbits are there?", "answer": 5, "type": "addition"},
        {"question": "If you have 6 fish and 1 dies, how many fish do you have left?", "answer": 5, "type": "subtraction"},
        {"question": "If you count 2 lions and 3 tigers, how many big cats do you see?", "answer": 5, "type": "addition"}
    ],
    "medium": [
        {"question": "12 + 8 = ?", "answer": 20, "type": "addition"},
        {"question": "15 - 7 = ?", "answer": 8, "type": "subtraction"},
        {"question": "6 × 4 = ?", "answer": 24, "type": "multiplication"},
        {"question": "20 ÷ 4 = ?", "answer": 5, "type": "division"},
        {"question": "3/4 of 12 = ?", "answer": 9, "type": "fraction"},
        {"question": "10 + 15 = ?", "answer": 25, "type": "addition"},
        {"question": "18 - 9 = ?", "answer": 9, "type": "subtraction"},
        {"question": "5 × 6 = ?", "answer": 30, "type": "multiplication"},
        {"question": "16 ÷ 2 = ?", "answer": 8, "type": "division"},
        {"question": "If you have 5 horses and 3 more arrive, how many horses are there?", "answer": 8, "type": "addition"},
        {"question": "If a zoo has 12 monkeys and 4 escape, how many are left?", "answer": 8, "type": "subtraction"},
        {"question": "If each cage has 3 birds and there are 4 cages, how many birds total?", "answer": 12, "type": "multiplication"},
        {"question": "If you have 20 fish and put them in 4 tanks equally, how many per tank?", "answer": 5, "type": "division"},
        {"question": "If 1/2 of 16 animals are cats, how many cats are there?", "answer": 8, "type": "fraction"}
    ],
    "hard": [
        {"question": "25 + 37 = ?", "answer": 62, "type": "addition"},
        {"question": "48 - 19 = ?", "answer": 29, "type": "subtraction"},
        {"question": "7 × 8 = ?", "answer": 56, "type": "multiplication"},
        {"question": "2/3 of 18 = ?", "answer": 12, "type": "fraction"},
        {"question": "15 + 23 - 8 = ?", "answer": 30, "type": "mixed"},
        {"question": "34 + 28 = ?", "answer": 62, "type": "addition"},
        {"question": "56 - 23 = ?", "answer": 33, "type": "subtraction"},
        {"question": "9 × 7 = ?", "answer": 63, "type": "multiplication"},
        {"question": "3/4 of 24 = ?", "answer": 18, "type": "fraction"},
        {"question": "If a farm has 25 cows and 37 sheep, how many farm animals total?", "answer": 62, "type": "addition"},
        {"question": "If a zoo has 48 penguins and 19 are moved to another zoo, how many remain?", "answer": 29, "type": "subtraction"},
        {"question": "If each aquarium has 7 fish and there are 8 aquariums, how many fish total?", "answer": 56, "type": "multiplication"},
        {"question": "If 2/3 of 18 animals are mammals, how many mammals are there?", "answer": 12, "type": "fraction"},
        {"question": "If you see 15 birds, 23 fish, and 8 fly away, how many animals remain?", "answer": 30, "type": "mixed"}
    ]
}

READING_CHALLENGES = {
    "easy": [
        {"word": "cat", "hint": "A furry pet that says meow"},
        {"word": "dog", "hint": "A friendly pet that barks"},
        {"word": "bird", "hint": "An animal that can fly"},
        {"word": "fish", "hint": "An animal that swims in water"},
        {"word": "pig", "hint": "A pink farm animal that says oink"},
        {"word": "cow", "hint": "A farm animal that gives milk"},
        {"word": "duck", "hint": "A bird that swims and says quack"},
        {"word": "frog", "hint": "A green animal that jumps and says ribbit"},
        {"word": "bee", "hint": "A yellow and black insect that makes honey"},
        {"word": "ant", "hint": "A small insect that lives in groups"},
        {"word": "run", "hint": "Move fast on your feet"},
        {"word": "jump", "hint": "Go up in the air"},
        {"word": "play", "hint": "Have fun with toys"},
        {"word": "eat", "hint": "Put food in your mouth"},
        {"word": "sleep", "hint": "Close your eyes and rest"}
    ],
    "medium": [
        {"word": "elephant", "hint": "A very large gray animal with a long trunk"},
        {"word": "giraffe", "hint": "A tall animal with a very long neck"},
        {"word": "penguin", "hint": "A black and white bird that cannot fly but swims"},
        {"word": "dolphin", "hint": "A smart sea animal that jumps out of water"},
        {"word": "lion", "hint": "A big cat that is the king of the jungle"},
        {"word": "tiger", "hint": "A big cat with orange and black stripes"},
        {"word": "monkey", "hint": "A playful animal that climbs trees"},
        {"word": "zebra", "hint": "A horse-like animal with black and white stripes"},
        {"word": "bear", "hint": "A large furry animal that can be brown or black"},
        {"word": "wolf", "hint": "A wild dog that lives in packs"},
        {"word": "fox", "hint": "A small wild dog with a bushy tail"},
        {"word": "rabbit", "hint": "A small animal with long ears that hops"},
        {"word": "adventure", "hint": "An exciting journey"},
        {"word": "treasure", "hint": "Valuable hidden items"},
        {"word": "village", "hint": "A small community of houses"},
        {"word": "forest", "hint": "A place with many trees"},
        {"word": "cave", "hint": "A hole in the mountain"}
    ],
    "hard": [
        {"word": "hippopotamus", "hint": "A large gray animal that lives in water"},
        {"word": "rhinoceros", "hint": "A large animal with a horn on its nose"},
        {"word": "crocodile", "hint": "A large reptile that lives in water"},
        {"word": "kangaroo", "hint": "An Australian animal that hops and carries babies in a pouch"},
        {"word": "octopus", "hint": "A sea animal with eight arms"},
        {"word": "gorilla", "hint": "A large ape that is very strong"},
        {"word": "chimpanzee", "hint": "A smart ape that is similar to humans"},
        {"word": "panda", "hint": "A black and white bear that eats bamboo"},
        {"word": "koala", "hint": "An Australian animal that looks like a small bear"},
        {"word": "platypus", "hint": "An Australian animal that lays eggs and has a duck-like bill"},
        {"word": "exploration", "hint": "The act of discovering new places"},
        {"word": "achievement", "hint": "Something you accomplish"},
        {"word": "knowledge", "hint": "What you learn and understand"},
        {"word": "challenge", "hint": "A difficult task to complete"},
        {"word": "success", "hint": "Reaching your goal"}
    ]
}

# Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Create initial progress for the user
    progress = PlayerProgress(user_id=new_user.id)
    db.session.add(progress)
    
    # Create initial inventory for the user
    inventory = PlayerInventory(user_id=new_user.id)
    db.session.add(inventory)
    
    db.session.commit()
    
    # Generate token
    access_token = create_access_token(identity=new_user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    }), 200

@app.route('/api/user/progress', methods=['GET'])
@jwt_required()
def get_progress():
    user_id = get_jwt_identity()
    progress = PlayerProgress.query.filter_by(user_id=user_id).first()
    
    if not progress:
        return jsonify({'error': 'Progress not found'}), 404
    
    return jsonify({
        'level': progress.level,
        'xp': progress.xp,
        'coins': progress.coins,
        'current_stage': progress.current_stage,
        'unlocked_areas': json.loads(progress.unlocked_areas),
        'achievements': json.loads(progress.achievements),
        'high_scores': json.loads(progress.high_scores),
        'best_times': json.loads(progress.best_times),
        'last_save': progress.last_save.isoformat()
    }), 200

@app.route('/api/user/progress', methods=['PUT'])
@jwt_required()
def update_progress():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    progress = PlayerProgress.query.filter_by(user_id=user_id).first()
    
    if not progress:
        return jsonify({'error': 'Progress not found'}), 404
    
    # Update progress fields
    if 'level' in data:
        progress.level = data['level']
    if 'xp' in data:
        progress.xp = data['xp']
    if 'coins' in data:
        progress.coins = data['coins']
    if 'current_stage' in data:
        progress.current_stage = data['current_stage']
    if 'unlocked_areas' in data:
        progress.unlocked_areas = json.dumps(data['unlocked_areas'])
    if 'achievements' in data:
        progress.achievements = json.dumps(data['achievements'])
    if 'high_scores' in data:
        progress.high_scores = json.dumps(data['high_scores'])
    if 'best_times' in data:
        progress.best_times = json.dumps(data['best_times'])
    
    progress.last_save = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Progress updated successfully',
        'progress': {
            'level': progress.level,
            'xp': progress.xp,
            'coins': progress.coins,
            'current_stage': progress.current_stage,
            'unlocked_areas': json.loads(progress.unlocked_areas),
            'achievements': json.loads(progress.achievements),
            'high_scores': json.loads(progress.high_scores),
            'best_times': json.loads(progress.best_times),
            'last_save': progress.last_save.isoformat()
        }
    }), 200

@app.route('/api/user/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    user_id = get_jwt_identity()
    inventory = PlayerInventory.query.filter_by(user_id=user_id).first()
    
    if not inventory:
        return jsonify({'error': 'Inventory not found'}), 404
    
    return jsonify({
        'items': json.loads(inventory.items),
        'home_decorations': json.loads(inventory.home_decorations),
        'character_cards': json.loads(inventory.character_cards),
        'unlocked_characters': json.loads(inventory.unlocked_characters),
        'last_updated': inventory.last_updated.isoformat()
    }), 200

@app.route('/api/user/inventory', methods=['PUT'])
@jwt_required()
def update_inventory():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    inventory = PlayerInventory.query.filter_by(user_id=user_id).first()
    
    if not inventory:
        return jsonify({'error': 'Inventory not found'}), 404
    
    # Update inventory fields
    if 'items' in data:
        inventory.items = json.dumps(data['items'])
    if 'home_decorations' in data:
        inventory.home_decorations = json.dumps(data['home_decorations'])
    
    inventory.last_updated = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Inventory updated successfully',
        'inventory': {
            'items': json.loads(inventory.items),
            'home_decorations': json.loads(inventory.home_decorations),
            'character_cards': json.loads(inventory.character_cards),
            'unlocked_characters': json.loads(inventory.unlocked_characters),
            'last_updated': inventory.last_updated.isoformat()
        }
    }), 200

@app.route('/api/game/stages', methods=['GET'])
@jwt_required()
def get_stages():
    return jsonify(STAGES), 200

@app.route('/api/game/characters', methods=['GET'])
@jwt_required()
def get_characters():
    return jsonify(MINECRAFT_CHARACTERS), 200

@app.route('/api/game/challenge/<challenge_type>', methods=['GET'])
@jwt_required()
def get_challenge(challenge_type):
    user_id = get_jwt_identity()
    progress = PlayerProgress.query.filter_by(user_id=user_id).first()
    
    if not progress:
        return jsonify({'error': 'Progress not found'}), 404
    
    # Determine difficulty based on level
    if progress.level <= 3:
        difficulty = "easy"
    elif progress.level <= 6:
        difficulty = "medium"
    else:
        difficulty = "hard"
    
    if challenge_type == "math":
        import random
        challenge = random.choice(MATH_PROBLEMS[difficulty])
        return jsonify({
            'type': 'math',
            'question': challenge['question'],
            'difficulty': difficulty,
            'hint': f"This is a {challenge['type']} problem"
        }), 200
    
    elif challenge_type == "reading":
        import random
        challenge = random.choice(READING_CHALLENGES[difficulty])
        return jsonify({
            'type': 'reading',
            'word': challenge['word'],
            'hint': challenge['hint'],
            'difficulty': difficulty
        }), 200
    
    else:
        return jsonify({'error': 'Invalid challenge type'}), 400

@app.route('/api/game/verify-answer', methods=['POST'])
@jwt_required()
def verify_answer():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'answer' not in data or 'challenge_type' not in data:
        return jsonify({'error': 'Missing answer or challenge type'}), 400
    
    progress = PlayerProgress.query.filter_by(user_id=user_id).first()
    
    if not progress:
        return jsonify({'error': 'Progress not found'}), 404
    
    # Determine difficulty based on level
    if progress.level <= 3:
        difficulty = "easy"
    elif progress.level <= 6:
        difficulty = "medium"
    else:
        difficulty = "hard"
    
    is_correct = False
    earned_xp = 0
    earned_coins = 0
    earned_item = None
    correct_answer = None
    
    if data['challenge_type'] == 'math':
        # For math challenges, we need the original question to verify
        if 'question' in data:
            # Find the question in our database
            for problem in MATH_PROBLEMS[difficulty]:
                if problem['question'] == data['question']:
                    correct_answer = str(problem['answer'])
                    is_correct = correct_answer.lower() == str(data['answer']).lower()
                    break
        
        if is_correct:
            earned_xp = 10
            earned_coins = 5
            # Random chance to earn items
            import random
            if random.random() < 0.3:  # 30% chance
                items = ['wood', 'stone', 'diamond']
                earned_item = random.choice(items)
    
    elif data['challenge_type'] == 'reading':
        # For reading challenges, we need the word to verify
        if 'word' in data:
            correct_answer = data['word']
            is_correct = correct_answer.lower() == data['answer'].lower()
        
        if is_correct:
            earned_xp = 8
            earned_coins = 3
            # Random chance to earn items
            import random
            if random.random() < 0.2:  # 20% chance
                items = ['wood', 'stone']
                earned_item = random.choice(items)
    
    # Update progress if correct
    if is_correct:
        progress.xp += earned_xp
        progress.coins += earned_coins
        
        # Update inventory if item earned
        if earned_item:
            inventory = PlayerInventory.query.filter_by(user_id=user_id).first()
            if inventory:
                current_items = json.loads(inventory.items)
                current_items[earned_item] = current_items.get(earned_item, 0) + 1
                inventory.items = json.dumps(current_items)
        
        # Update character card progress
        inventory = PlayerInventory.query.filter_by(user_id=user_id).first()
        if inventory:
            import random
            character_cards = json.loads(inventory.character_cards)
            unlocked_characters = json.loads(inventory.unlocked_characters)
            
            # Randomly select a character to progress (if not all unlocked)
            available_characters = [char_id for char_id in MINECRAFT_CHARACTERS.keys() 
                                  if char_id not in unlocked_characters]
            
            if available_characters:
                selected_character = random.choice(available_characters)
                current_progress = character_cards.get(selected_character, 0)
                new_progress = current_progress + 1
                character_cards[selected_character] = new_progress
                
                # Check if character is fully unlocked (4 correct answers)
                if new_progress >= 4:
                    unlocked_characters.append(selected_character)
                
                inventory.character_cards = json.dumps(character_cards)
                inventory.unlocked_characters = json.dumps(unlocked_characters)
                db.session.commit()
        
        # Check for level up
        xp_needed = progress.level * 50
        if progress.xp >= xp_needed:
            progress.level += 1
            progress.xp = 0
            earned_xp += 20  # Bonus XP for leveling up
            earned_coins += 10  # Bonus coins for leveling up
        
        # Check for stage unlock
        for stage_id, stage_data in STAGES.items():
            if stage_data['xp_required'] <= progress.xp and stage_id not in json.loads(progress.unlocked_areas):
                unlocked_areas = json.loads(progress.unlocked_areas)
                unlocked_areas.append(stage_id)
                progress.unlocked_areas = json.dumps(unlocked_areas)
        
        db.session.commit()
    
    return jsonify({
        'correct': is_correct,
        'earned_xp': earned_xp,
        'earned_coins': earned_coins,
        'earned_item': earned_item,
        'correct_answer': correct_answer,
        'new_level': progress.level,
        'new_xp': progress.xp,
        'new_coins': progress.coins,
        'unlocked_areas': json.loads(progress.unlocked_areas)
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'MindCraft API is running'}), 200

@app.route('/api/test/characters', methods=['GET'])
def test_characters():
    return jsonify({
        'characters': MINECRAFT_CHARACTERS,
        'count': len(MINECRAFT_CHARACTERS)
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5001)
