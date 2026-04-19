# Get Your Bot - AI Chatbot Builder

Build intelligent chatbots powered by your own documents, FAQs, and knowledge base. Embed them anywhere with a single script tag.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![Node.js](https://img.shields.io/badge/Node.js-24.x-green)
![Prisma](https://img.shields.io/badge/Prisma-7.x-1a1a1a)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Document Training** - Upload PDFs to train your chatbot on your content
- **FAQ Support** - Add question-answer pairs for precise responses
- **Multi-Provider AI** - Support for OpenAI GPT and Google Gemini
- **Widget Embedding** - Embed chatbots on any website with a single script tag
- **Theme Customization** - Customize colors and welcome messages
- **Real-time Chat** - Interactive chat interface for testing

## Architecture

```
Frontend (Next.js)
    ↓
Backend API (Express + Node.js)
    ↓
Database (PostgreSQL via Supabase)
    ↓
Cloudinary (file storage)
    ↓
AI APIs (OpenAI / Gemini)
```

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Custom design system

### Backend
- Node.js + Express
- Prisma ORM
- JWT authentication
- Multer for file uploads
- pdfjs-dist for PDF text extraction

### Infrastructure
- PostgreSQL (Supabase)
- Cloudinary (file storage)
- Render (hosting)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Supabase or local)
- Cloudinary account (for file uploads)
- OpenAI or Gemini API key (for AI responses)

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend (`backend/.env`)**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
ENCRYPTION_KEY="your-32-char-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3001
```

**Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd get-your-bot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Running on Render (Production)

The backend is configured for [Render](https://render.com) deployment:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && node src/index.js`
5. Add environment variables from your `.env` file
6. Deploy

**Important:** Render's free tier spins down after 15 minutes of inactivity. The first request after dormancy will trigger a cold start (~30 seconds). The frontend includes a backend health check that displays a loading screen until the backend is ready.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/me` | Get current user |

### Bots
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bots` | List all bots |
| POST | `/bots` | Create new bot |
| GET | `/bots/:id` | Get bot details |
| PUT | `/bots/:id` | Update bot |
| DELETE | `/bots/:id` | Delete bot |

### Context
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/context/text` | Add text context |
| POST | `/context/faq` | Add FAQ context |
| GET | `/context/:botId` | List context |
| DELETE | `/context/:botId/:contextId` | Delete context |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/upload` | Upload PDF document |
| GET | `/documents/:botId` | List documents |
| DELETE | `/documents/:botId/:documentId` | Delete document |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send message to bot |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Usage

### 1. Create a Bot
Navigate to the dashboard and create a new bot. You'll need:
- Bot name
- AI provider (OpenAI or Gemini)
- API key for your chosen provider

### 2. Add Knowledge
Choose one or more methods:
- **Text Context** - Add plain text information
- **FAQs** - Add question-answer pairs
- **PDF Documents** - Upload PDF files (max 5MB)

### 3. Test Your Bot
Use the built-in chat interface to test responses before embedding.

### 4. Embed on Website
Copy the embed script from the Embed tab and add it to your website:

```html
<script src="https://your-backend-url/widget.js" data-bot-id="YOUR_BOT_ID"></script>
```

## Project Structure

```
get-your-bot/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # Auth context
│   │   └── lib/             # API client
│   └── public/             # Static assets
│
├── backend/                 # Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── config/          # Configuration
│   │   └── utils/           # Utilities
│   └── static/              # Widget assets
│
├── CLAUDE.md                # Claude Code instructions
├── SRS.md                   # System specification
└── README.md               # This file
```

## Security

- API keys are encrypted using AES before storage
- JWT tokens for authentication
- Passwords hashed with bcrypt
- API keys never exposed to frontend

## License

MIT License - see LICENSE file for details.
