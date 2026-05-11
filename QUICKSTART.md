# Quick Start Guide 🚀

## Step 1: Install Dependencies

### Backend
```bash
cd c:\Users\User\Agents\kids-learning-app\backend
npm install
```

### Frontend
```bash
cd c:\Users\User\Agents\kids-learning-app\frontend
npm install
```

## Step 2: Create Environment File

Create `.env` file in the backend folder:

```bash
cd backend
copy .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
JWT_SECRET=your_secret_key_123
WHATSAPP_API_KEY=your_whatsapp_key
NODE_ENV=development
```

## Step 3: Start the Application

### Terminal 1 - Start Backend Server
```bash
cd backend
npm start
```

Expected output:
```
Server running on http://localhost:5000
```

### Terminal 2 - Start Frontend Development Server
```bash
cd frontend
npm start
```

Expected output:
```
Webpack compiled successfully
On Your Network: http://localhost:3000
```

## Step 4: Access the Application

Open your browser and navigate to: **http://localhost:3000**

## Step 5: Login with Demo Account

Use any of these credentials:
- Username: `itay` / Password: `password123`
- Username: `tal` / Password: `password123`
- Username: `leo` / Password: `password123`
- Username: `ariel` / Password: `password123`
- Username: `dean` / Password: `password123`
- Username: `ellie` / Password: `password123`

## Main Features to Try

### User Features
1. ✅ **Dashboard** - View your stats and select games
2. ✅ **Quizzes** - Answer Hebrew word translations
3. ✅ **Crosswords** - Fill in Hebrew words
4. ✅ **Memory Cards** - Match pairs
5. ✅ **Leaderboard** - See rankings

### Admin Features (Access from Dashboard)
1. 🎨 **App Customization** - Change colors and settings
2. 📚 **Word Bank** - Add Hebrew words
3. 📊 **Analytics** - View user activity

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is in use:
```bash
# Change backend port in server.js
PORT=5001 npm start

# Change frontend port (in frontend folder)
PORT=3001 npm start
```

### CORS Error
Make sure backend is running on http://localhost:5000 before starting frontend.

### Module Not Found
```bash
# Clear node_modules and reinstall
rmdir node_modules /s /q
npm install
```

### Can't Connect to Backend
- Verify backend server is running
- Check if firewall allows connections
- Verify correct API URL in frontend

## Project Structure

```
kids-learning-app/
├── README.md              # Full documentation
├── QUICKSTART.md         # This file
├── .gitignore
│
├── backend/
│   ├── server.js         # Main server file
│   ├── package.json
│   ├── .env.example
│   └── data/            # Data files
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js       # Main component
    │   ├── pages/       # Page components
    │   ├── styles/      # CSS files
    │   └── utils/       # Helper functions
    └── package.json
```

## Available Scripts

### Backend
```bash
npm start   # Start server
npm run dev # Start with nodemon (auto-reload)
```

### Frontend
```bash
npm start   # Start development server
npm build   # Build for production
npm test    # Run tests
```

## Next Steps

1. **Add More Words** - Go to Admin → Word Bank to add Hebrew words
2. **Customize Theme** - Go to Admin → App Customization to change colors
3. **Monitor Progress** - Go to Admin → Analytics to see user stats
4. **Enable Notifications** - Set up WhatsApp integration in settings

## API Testing

You can test API endpoints using Postman or curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"itay","password":"password123"}'

# Get Leaderboard
curl http://localhost:5000/api/users

# Get Words
curl http://localhost:5000/api/games/words
```

## Database Integration

To integrate with a real database (MongoDB, PostgreSQL, etc.):

1. Update `backend/data/users.js` to use your database
2. Update `backend/data/gameData.js` for game content
3. Install database driver: `npm install mongoose` or `npm install pg`
4. Create connection in `server.js`

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Creates build/ folder
```

### Deploy to Hosting
- Upload frontend `build/` folder to web hosting
- Deploy backend to server/cloud service
- Update API URL in frontend for production

## Support

For detailed information, see [README.md](README.md)

---

Happy learning! 🎮📚
