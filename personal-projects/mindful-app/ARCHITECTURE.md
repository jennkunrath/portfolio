# MindfulFlow — Architecture Notes

## Overview
MindfulFlow is a full-stack AI-powered mindful journaling and well-being application. Its core purpose is to foster positive reflection and personal growth through features such as a chat-like AI journal, an accomplishment tracker ("Ta-Done!" list), gratitude journaling, and goal management. The project aims to encourage mindful reflection and celebrate user achievements, providing a unique blend of AI interaction and personal development tools.

## System Architecture

### UI/UX Decisions
The application features a mobile-first, responsive design optimized for mobile devices, mimicking a phone-like messaging interface. The UI components are built using `shadcn/ui` on `Radix UI` primitives, styled with `Tailwind CSS` and custom CSS variables for theming. Key design elements include a soft, pulsing blue orb for the AI companion "Aiden," and a warm, gradient background for the "Ta-Done" area. Text size is customizable, and the chat layout is optimized for natural mobile messaging.

### Technical Implementations
- **Frontend**: React with TypeScript using Vite, `TanStack Query` for server state management, and `Wouter` for routing.
- **Backend**: Node.js with Express.js, written in TypeScript with ESM modules, providing a RESTful API with JSON responses.
- **Authentication**: Replit Auth using OpenID Connect, with `express-session` and `connect-pg-simple` for session management in PostgreSQL. Security includes HTTP-only cookies and CSRF protection.
- **AI Integration**: Leverages OpenAI GPT-4o for conversational AI, including contextual conversation continuation, automatic summarization, initial prompt generation, and conversation end detection. The AI's personality, "Aiden," is designed as an empathetic therapist-friend offering constructive challenge, balancing support with accountability.
- **Database Schema**: Utilizes PostgreSQL with `drizzle-orm` for type-safe operations. Key entities include Users, Sessions, Journal Entries (with conversation history), Ta-Done Items, Gratitude Items, and Goals.
- **Core Features**:
    - **AI Conversational Journal**: A chat interface with Aiden, featuring auto-save and daily persistent conversations that align with the user's timezone. Journal entries are only created upon the user's first message to prevent empty conversations.
    - **Ta-Done List**: A celebration-focused accomplishment tracker with the ability to link items to goals.
    - **Gratitude List**: A simple system for entering and viewing gratitude entries.
    - **Goal Tracker**: For setting intentions and managing their status.
    - **AI-Powered Journal Search & Analysis**: Allows users to ask questions about their journal entries, providing insights into patterns and trends.
    - **Voice Input Integration**: Speech-to-text functionality for chat.
    - **Custom Profile Picture Upload**: Users can upload custom profile pictures.
    - **Custom Display Name**: Users can set custom display names that appear throughout the app with intelligent fallback priority.
    - **Time-Aware Thoughtful Prompts**: Initial prompts adapt based on the time of day in the user's timezone.

### System Design Choices
The system enforces a single conversation per day, auto-saving in real-time. Journal entries are created only when a user sends their first message. Timezone settings are comprehensively integrated to ensure daily conversation boundaries and time-aware prompts align with the user's local time. Data persistence is managed via `React Query` for frontend data fetching, with `Zod` schemas for input validation and `Drizzle ORM` for database interactions. An admin panel is included for user management and OpenAI cost tracking.

## External Dependencies

### Core Dependencies
- `@neondatabase/serverless`: PostgreSQL database connectivity
- `drizzle-orm`: Type-safe database ORM
- `openai`: Official OpenAI SDK
- `@tanstack/react-query`: Server state management
- `wouter`: Lightweight routing
- `@radix-ui/*`: Accessible UI primitives

### Authentication & Security
- `openid-client`: OpenID Connect authentication with Replit
- `passport`: Authentication middleware
- `express-session`: Session management
- `connect-pg-simple`: PostgreSQL session store

### Development Tools (Actual Integrations)
- `tailwindcss`: Utility-first CSS framework