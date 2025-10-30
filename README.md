# MatchFlix - Dating App MVP

A full-stack dating application with profile creation, user discovery, matching, and real-time chat.

## Features

- 🔐 **Authentication**: Secure JWT-based authentication
- 👤 **Profile Management**: Create and edit detailed user profiles with photos and preferences
- 🔍 **User Discovery**: Browse and discover potential matches
- 💝 **Smart Matching**: Match based on preferences (age, gender, interests, location)
- 💬 **Real-time Chat**: Chat with matched users using Socket.io
- 📱 **Responsive Design**: Modern, mobile-friendly UI

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui components
- Lucide icons
- Socket.io client

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Socket.io
- JWT authentication
- bcrypt for password hashing

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb matchflix
```

### 3. Environment Variables

Create `.env` files in both frontend and backend directories:

**backend/.env**:
```
DATABASE_URL="postgresql://username:password@localhost:5432/matchflix"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=5000
NODE_ENV=development
```

**frontend/.env.local**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Run Database Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 5. Start Development Servers

```bash
npm run dev
```

This will start:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## Project Structure

```
matchflix/
├── frontend/           # Next.js frontend
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities and API client
│   │   └── types/     # TypeScript types
│   └── public/        # Static assets
├── backend/           # Express backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── socket/       # Socket.io handlers
│   │   └── prisma/       # Database schema
│   └── uploads/          # User uploaded images
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/photo` - Upload profile photo

### Discovery
- `GET /api/users/discover` - Get potential matches
- `GET /api/users/:id` - Get user profile

### Matching
- `POST /api/matches/like/:userId` - Like a user
- `POST /api/matches/pass/:userId` - Pass on a user
- `GET /api/matches` - Get all matches

### Chat
- `GET /api/messages/:matchId` - Get messages for a match
- WebSocket events for real-time messaging

## Default Test Users

After running migrations, you can create test users via the registration page or use the API directly.

## Development Notes

- The app uses JWT tokens stored in localStorage for authentication
- Profile photos are stored in the backend/uploads directory
- Real-time chat uses Socket.io with JWT authentication
- Matching algorithm considers age range, gender preferences, and interests

## Future Enhancements

- Photo verification
- Video chat
- Advanced matching algorithm with ML
- Location-based matching with maps
- Push notifications
- Social media integration
- Profile verification badges

## License

MIT
