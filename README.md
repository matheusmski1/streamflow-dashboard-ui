# Streamflow Dashboard

A real-time streaming dashboard built with Next.js 15, React, and Tailwind CSS. This dashboard provides live event monitoring, analytics, and user management capabilities.

## 🚀 Features

- **Real-time Event Streaming**: Live event monitoring with Server-Sent Events
- **Authentication System**: Secure JWT-based authentication
- **Analytics Dashboard**: Comprehensive analytics and metrics
- **Responsive Design**: Mobile-first responsive UI
- **Dark/Light Theme**: Built-in theme switching
- **Modern Stack**: Next.js 15, React 18, TypeScript, Tailwind CSS

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- A backend API server (see API Requirements below)
- Optional: Redis for session management
- Optional: Database for persistent storage

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd streamflow-dashboard-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   ```
   http://localhost:3000
   ```

## 🚧 Development Mode (No Backend Required)

If you want to test the UI without implementing a backend, the project includes a **development mode** that allows basic login functionality:

### Quick Start (Development Mode)
1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Login with any valid email and password (minimum 3 characters)
4. Explore the interface (streaming and analytics will show empty states)

### What Works in Development Mode:
- ✅ **Authentication**: Login/logout with any valid credentials
- ✅ **Navigation**: All pages and routing
- ✅ **UI Components**: Full interface exploration
- ❌ **Live Streaming**: Requires real API implementation
- ❌ **Analytics Data**: Requires real API implementation

### Disabling Development Mode:
To disable development login (e.g., for production), set in `.env.local`:
```env
NEXT_PUBLIC_ENABLE_DEV_LOGIN=false
```

## 🔧 API Requirements

This dashboard requires a backend API server that provides the following endpoints:

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify
POST /api/auth/refresh
```

### Stream Endpoints
```
GET  /api/stream/events (Server-Sent Events)
GET  /api/stream/stats
```

### Analytics Endpoints
```
GET  /api/analytics/dashboard
GET  /api/analytics/performance
GET  /api/analytics/engagement
```

### User Endpoints
```
GET  /api/user/profile
PUT  /api/user/settings
```

## 📡 API Integration

### Authentication Flow

1. **Login Request**
   ```typescript
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password"
   }
   ```

2. **Expected Response**
   ```typescript
   {
     "token": "jwt-token-here",
     "user": {
       "id": "user-id",
       "name": "User Name",
       "email": "user@example.com",
       "avatar": "avatar-url"
     }
   }
   ```

### Stream Events Format

Server-Sent Events should send JSON data in this format:
```typescript
{
  "id": "event-id",
  "timestamp": "2024-01-01T00:00:00Z",
  "event_type": "user_action|system_event|error|warning",
  "user_id": "user-id",
  "data": {
    "action": "click|view|purchase|login|logout",
    "value": 100,
    "location": "homepage|dashboard|profile|settings"
  }
}
```

### Analytics Data Format

Analytics endpoints should return:
```typescript
{
  "totalViews": 125842,
  "conversionRate": 3.2,
  "activeUsers": 1429,
  "bounceRate": 24.1
}
```

## 🔨 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript check

### Project Structure

```
src/
├── app/                 # Next.js 15 App Router
│   ├── dashboard/       # Dashboard page
│   ├── analytics/       # Analytics page
│   ├── settings/        # Settings page
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── StreamTable.tsx  # Event streaming table
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── ...
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
└── lib/                 # Utilities
    ├── api.ts          # API client and configuration
    └── utils.ts        # Helper functions
```

## ⚙️ Configuration

### API Client

The API client is configured in `src/lib/api.ts`. You can customize endpoints and add new methods:

```typescript
import { apiClient } from '@/lib/api';

// Example usage
const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiClient.login(email, password);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### Server-Sent Events

For real-time streaming, implement the `StreamEventSource`:

```typescript
import { StreamEventSource } from '@/lib/api';

const streamSource = new StreamEventSource();

streamSource.connect(
  (event) => {
    const data = JSON.parse(event.data);
    // Handle incoming stream event
  },
  (error) => {
    console.error('Stream error:', error);
  }
);
```

## 🚦 Backend Implementation

To get started quickly, you need a backend that implements the required endpoints. Here's an example Express.js server structure:

```javascript
// Basic server structure
app.post('/api/auth/login', loginHandler);
app.get('/api/stream/events', streamEventsHandler); // SSE
app.get('/api/analytics/dashboard', analyticsHandler);
```

### Example Stream Events Endpoint (Express.js)

```javascript
app.get('/api/stream/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send periodic events
  const interval = setInterval(() => {
    const event = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      event_type: 'user_action',
      user_id: 'user_123',
      data: {
        action: 'click',
        value: Math.floor(Math.random() * 1000),
        location: 'homepage'
      }
    };
    
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});
```

## 🔐 Security

- All API requests include JWT authentication headers
- Environment variables for sensitive configuration
- CORS configured for cross-origin requests
- Input validation on forms
- Secure token storage in localStorage

## 🎨 Theming

The application supports dark/light themes using Tailwind CSS and CSS variables. Theme configuration is in `tailwind.config.ts`.

## 📱 Mobile Support

Fully responsive design that works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set these in your deployment environment:
- `NEXT_PUBLIC_API_URL` - Your production API URL

### Deploy to Vercel

```bash
npx vercel
```

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication service not configured"**
   - Ensure your backend API is running
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Verify authentication endpoints are implemented

2. **"Stream service not configured"**
   - Implement Server-Sent Events endpoint (`/api/stream/events`)
   - Check CORS configuration on your backend
   - Verify the stream endpoint is accessible

3. **Analytics not loading**
   - Implement analytics endpoints in your backend
   - Check authentication headers are being sent
   - Verify data format matches expected schema

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Open an issue on GitHub
- Review the API requirements

---

**Note**: This dashboard requires a backend API to function. The application will show configuration warnings until the required endpoints are implemented. 