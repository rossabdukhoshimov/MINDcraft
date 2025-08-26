# MindCraft - Educational Adventure Game

A Minecraft-inspired educational web game that combines learning with adventure! Players explore different worlds while solving math and reading challenges to progress through levels and unlock new areas.

## 🎮 Game Features

### **Educational Gameplay Loop**
- **Blocky Character**: Minecraft-style player exploring themed worlds
- **Challenge Gates**: Pass through by completing math or reading mini-games
- **Progressive Learning**: Difficulty increases with each level-up
- **Rewards System**: Earn XP, coins, and items for completing challenges
- **Home Base**: Decorate your personal space with collected items

### **Four Unique Stages**

#### 🌲 **Stage 1: Number Woods**
- **Theme**: Addition & Subtraction Basics
- **Gameplay**: Solve math problems to "chop" trees and collect coins
- **Reading Element**: Simple sight words on signs provide hints

#### 🏘️ **Stage 2: Word Village**
- **Theme**: Reading Comprehension & Vocabulary
- **Gameplay**: Help villagers by choosing correct words from signs/chests
- **Math Twist**: Some gates require solving problems before talking to villagers

#### ⛏️ **Stage 3: Fraction Caves**
- **Theme**: Fractions & Multiplication
- **Gameplay**: Break blocks matching the fraction of shapes shown
- **Reading Twist**: Story text on cave walls provides hints

#### ☁️ **Stage 4: The Sky Tower**
- **Theme**: Mixed Challenges & Timed Puzzles
- **Gameplay**: Answer both math & reading questions to climb platforms
- **Challenge**: Complete puzzles before time runs out

### **Progress & Persistence**
- **Player Profile**: Name, XP, coins, current level
- **Inventory System**: Collect and manage items
- **Unlocked Areas**: Track progress through different stages
- **High Scores**: Best times and performance records
- **Achievements**: Unlock badges for accomplishments

### **Minecraft-Like Experience**
- **Blocky Graphics**: 16×16 or 32×32 pixel textures
- **Retro Sound Effects**: 8-bit sounds for interactions
- **Calm Background Music**: Minecraft-inspired ambient tracks
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Project Structure

```
mindcraft/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/     # Game components
│   │   ├── App.js          # Main app with routing
│   │   └── index.js        # Entry point
│   └── public/             # Static assets
├── backend/           # Python Flask API
│   ├── app.py             # Main API with game logic
│   ├── init_db.py         # Database initialization
│   └── requirements.txt   # Python dependencies
├── database/          # Database files
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Automated Setup

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   python init_db.py
   ```

5. Run the backend server:
   ```bash
   python app.py
   ```

The backend will be available at `http://localhost:5001`

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/user/profile` - Get user profile
- `GET /api/user/progress` - Get player progress
- `PUT /api/user/progress` - Update player progress
- `GET /api/user/inventory` - Get player inventory
- `PUT /api/user/inventory` - Update player inventory

### Game Features
- `GET /api/game/stages` - Get all available stages
- `GET /api/game/challenge/<type>` - Get a new challenge (math/reading)
- `POST /api/game/verify-answer` - Submit and verify challenge answers

## 🎮 How to Play

1. **Create an Account**: Register with username, email, and password
2. **Start in Number Woods**: Begin with basic math challenges
3. **Complete Challenges**: Solve problems to earn XP and coins
4. **Level Up**: Gain enough XP to unlock new stages
5. **Explore New Areas**: Progress through Word Village, Fraction Caves, and Sky Tower
6. **Collect Items**: Gather resources for your home base
7. **Track Progress**: Monitor your achievements and statistics

## 👤 Default Admin Account

- **Username**: admin
- **Password**: admin123

## 🛠️ Development

### Backend Development
- **API Documentation**: `http://localhost:5001/docs`
- **Database**: SQLite (easily upgradable to PostgreSQL/MySQL)
- **Authentication**: JWT tokens with secure password hashing

### Frontend Development
- **Framework**: React with modern hooks
- **Routing**: React Router for navigation
- **Styling**: CSS3 with responsive design
- **State Management**: React hooks and context

## 🎨 Customization

### Adding New Challenges
1. Update `MATH_PROBLEMS` or `READING_CHALLENGES` in `backend/app.py`
2. Add new difficulty levels as needed
3. Challenges automatically scale with player level

### Creating New Stages
1. Add stage data to `STAGES` dictionary in `backend/app.py`
2. Update frontend components to handle new stage types
3. Add stage-specific styling in CSS files

### Modifying Rewards
1. Adjust XP and coin rewards in `verify_answer()` function
2. Update achievement criteria in the backend
3. Modify level-up requirements as needed

## 📱 Responsive Design

The game is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch devices

## 🔒 Security Features

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Secure token-based sessions
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin request security
- **SQL Injection Prevention**: Parameterized queries

## 🚀 Deployment

### Production Setup
1. Set environment variables for production
2. Use a production database (PostgreSQL/MySQL)
3. Configure HTTPS certificates
4. Set up proper logging and monitoring

### Environment Variables
```bash
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-production-jwt-key
DATABASE_URL=your-production-database-url
FLASK_ENV=production
DEBUG=False
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Educational Goals

This game is designed to:
- Make learning math and reading fun and engaging
- Provide progressive difficulty that adapts to player skill
- Encourage exploration and discovery
- Build confidence through achievement systems
- Support different learning styles through varied challenges

---

**Happy Learning and Gaming! 🎮📚**
