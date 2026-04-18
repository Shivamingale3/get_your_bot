# 🧠 AI Chatbot Builder Platform (V1) — Full System Spec

## 🎯 Goal

Build a **multi-tenant AI chatbot builder platform** where users can:

- Create bots
- Upload knowledge (text + PDFs)
- Use their own AI API key
- Embed chatbot into their website via script

---

# 🧱 Tech Stack

## Frontend

- Next.js (App Router)
- Tailwind CSS

## Backend

- Node.js + Express

## Database

- PostgreSQL (Supabase)

## Storage

- Cloudinary (PDF uploads)

## AI Providers

- OpenAI / Google Gemini (user-provided keys)

---

# 🧩 High-Level Architecture

```
Frontend (Next.js)
   ↓
Backend API (Node/Express)
   ↓
Database (Supabase Postgres)
   ↓
Cloudinary (file storage)
   ↓
AI APIs (OpenAI/Gemini)
```

---

# 👤 Core Entities

## User

```
id (uuid)
email
password_hash
created_at
```

---

## Bot

```
id (uuid)
user_id (fk)
name
welcome_message
theme_color
provider (openai/gemini)
api_key_encrypted
created_at
```

---

## Context

```
id (uuid)
bot_id (fk)
type (text | faq)
content (text/json)
created_at
```

---

## Document

```
id (uuid)
bot_id (fk)
file_url
extracted_text
summary
created_at
```

---

## ChatLog (optional V1)

```
id (uuid)
bot_id
question
response
created_at
```

---

# 🔐 Authentication

- JWT-based auth
- Routes protected via middleware
- Password hashed (bcrypt)

---

# ⚙️ Core Features

---

## 1. User Authentication

### APIs

```
POST /auth/register
POST /auth/login
```

---

## 2. Bot Management

### APIs

```
POST /bots
GET /bots
DELETE /bots/:id
```

---

## 3. Context Input

### Text

```
POST /context/text
{
  botId,
  content
}
```

### FAQ

```
POST /context/faq
{
  botId,
  faqs: [{ question, answer }]
}
```

---

## 4. Document Upload (PDF only)

### Flow

1. Upload file → Cloudinary
2. Get file URL
3. Extract text
4. Summarize
5. Store

---

### API

```
POST /documents/upload
multipart/form-data
```

---

### Implementation Steps

#### Upload to Cloudinary

- Use SDK
- Return `file_url`

---

#### Extract text

Use:

```
pdf-parse
```

---

#### Clean text

- Remove extra whitespace
- Normalize line breaks

---

#### Summarize (IMPORTANT)

Call AI once:

```
Summarize this document for chatbot usage:
{text}
```

Store:

- extracted_text
- summary

---

## 5. Chat System

### API

```
POST /chat
{
  botId,
  message
}
```

---

### Flow

1. Fetch bot
2. Decrypt API key
3. Fetch:
   - text context
   - FAQs
   - document summaries

---

### Build Prompt

```
You are a helpful support assistant.

Context:
{all text + FAQ + summaries}

Rules:
- Answer ONLY using provided context
- If answer not found, say "I don't know"

User:
{message}
```

---

### Call AI

- Use selected provider
- Pass user API key

---

### Return

```
{
  response: "..."
}
```

---

## 6. Embed Widget

### Script

```
<script src="https://yourapp.com/widget.js" data-bot-id="BOT_ID"></script>
```

---

### Widget Behavior

- Floating button (bottom-right)
- Opens chat modal
- Sends messages to `/chat`
- Displays responses

---

### Widget Tech

- Vanilla JS or small React bundle
- Hosted via backend/static

---

## 7. API Key Handling (CRITICAL)

- Encrypt before storing (AES or similar)
- Decrypt only during request
- Never expose to frontend

---

# 🎨 Frontend Pages

## 1. Auth

- Login
- Register

---

## 2. Dashboard

- List bots
- Create bot

---

## 3. Bot Detail Page

Tabs:

### A. Settings

- Name
- Welcome message
- Theme color
- API key input

---

### B. Context

- Add text
- Add FAQs

---

### C. Documents

- Upload PDF
- Show uploaded list

---

### D. Test Chat

- Chat UI

---

### E. Embed

- Show script snippet

---

# ⚡ Constraints (IMPORTANT)

- Max PDF size: 5MB
- Max context length: truncate to ~10k chars
- Response time target: <3 seconds

---

# ❌ Out of Scope (V1)

- Embeddings / vector DB
- Multi-language support
- Conversation memory
- Advanced analytics

---

# 💡 Future (Phase 2)

- Chunking + embeddings
- Semantic search
- Source attribution
- Java Spring Boot backend

---

# 🚀 Build Order (STRICT)

1. Auth
2. Bot CRUD
3. Context input
4. Chat API (basic)
5. AI integration
6. Widget
7. Document upload + parsing
8. Summarization
9. Polish UI

---

# 🧠 Key Risks

- Large context → bad answers
- API key leaks → critical failure
- Slow responses → poor UX

---

# ✅ Success Criteria

- User can create bot
- Add context
- Upload PDF
- Chat works
- Widget works externally

---

# 🔥 Final Note

This is NOT a “chatbot”.

This is:
👉 Multi-tenant AI system
👉 External API orchestration
👉 Embed-ready product

Build clean. Don’t overbuild.
