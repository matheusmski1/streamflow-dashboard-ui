# StreamFlow Dashboard UI

A modern, responsive dashboard for real-time data streaming and order management built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### ✅ Implemented Features

- **🔐 Authentication System**
  - Login and Registration with JWT
  - Token verification and auto-refresh
  - Role-based access control (USER/ADMIN)
  - Development mode with mock authentication

- **📊 Real-time Streaming**
  - Server-Sent Events (SSE) integration
  - Live event monitoring with filters
  - Event type filtering (USER_ACTION, SYSTEM_EVENT, ERROR, WARNING)
  - User-specific event filtering
  - Connection status monitoring with retry logic

- **📦 Order Management**
  - Full CRUD operations for orders
  - Real-time order creation and updates
  - Order status management (PENDING, PROCESSING, COMPLETED, CANCELLED)
  - Search and filtering capabilities
  - Responsive data tables

- **👥 User Management** (Admin only)
  - User creation, editing, and deletion
  - Role management
  - User search and filtering
  - Profile management

- **🎨 Modern UI/UX**
  - Responsive design with mobile support
  - Dark/light theme support
  - Loading states and error handling
  - Toast notifications
  - Modal dialogs

### 🔧 Backend Integration

The dashboard is fully integrated with the NestJS backend API:

- **Authentication Endpoints**: `/auth/login`, `/auth/register`, `/auth/verify`
- **Orders Endpoints**: `/orders` (CRUD operations), `/orders/my-orders`
- **Users Endpoints**: `/users` (CRUD operations)
- **Streaming Endpoints**: `/stream` (SSE), `/stream/ping`

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 3001 (default)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd streamflow-dashboard-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   # Development Mode (set to 'true' for mock data)
   NEXT_PUBLIC_DEV_MODE=false
   
   # Optional: Enable debug logging
   NEXT_PUBLIC_DEBUG=false
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔄 Development vs Production Mode

### Development Mode (`NEXT_PUBLIC_DEV_MODE=true`)
- Uses mock data for all operations
- No real API calls are made
- Perfect for UI development and testing
- Allows login with any email/password

### Production Mode (`NEXT_PUBLIC_DEV_MODE=false`)
- Connects to real backend API
- Full authentication required
- Real data operations
- Requires backend server to be running

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── (protected)/       # Protected routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── orders/        # Orders management
│   │   ├── analytics/     # Analytics (placeholder)
│   │   └── settings/      # User settings and management
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── AuthLoader.tsx     # Authentication loading
│   ├── Dashboard.tsx      # Main dashboard
│   ├── LoginForm.tsx      # Login/register form
│   ├── ProtectedRoute.tsx # Route protection
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── StatCard.tsx       # Statistics card
│   ├── StreamTable.tsx    # Real-time events table
│   └── StoreProvider.tsx  # Zustand store provider
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── hooks/                 # Custom React hooks
│   └── useAuth.ts         # Authentication hook
├── lib/                   # Utility libraries
│   ├── api.ts            # API client and types
│   └── utils.ts          # Utility functions
└── store/                 # State management
    └── auth.ts           # Authentication store
```

## 🔌 API Integration

### Authentication

```typescript
import { apiClient } from '@/lib/api';

// Login
const response = await apiClient.login({ email, password });
localStorage.setItem('auth_token', response.access_token);

// Register
const response = await apiClient.register({ name, email, password });

// Verify token
const response = await apiClient.verifyToken();
```

### Orders Management

```typescript
// Get all orders
const orders = await apiClient.getOrders({ page: 1, limit: 10, search: 'term' });

// Create order
const newOrder = await apiClient.createOrder({
  customer: 'John Doe',
  product: 'Laptop',
  quantity: 1,
  price: 999.99,
  title: 'New Order',
  description: 'Order description',
  amount: 999.99,
  userId: 'user-id'
});

// Update order
const updatedOrder = await apiClient.updateOrder(orderId, updateData);

// Delete order
await apiClient.deleteOrder(orderId);
```

### Real-time Streaming

```typescript
import { StreamEventSource } from '@/lib/api';

const streamSource = new StreamEventSource();

streamSource.connect(
  (event) => {
    const data = JSON.parse(event.data);
    console.log('New event:', data);
  },
  (error) => console.error('Stream error:', error),
  () => console.log('Stream connected'),
  { type: 'USER_ACTION', userOnly: true } // Optional filters
);

// Disconnect when done
streamSource.disconnect();
```

### User Management

```typescript
// Get all users (Admin only)
const users = await apiClient.getUsers();

// Create user (Admin only)
const newUser = await apiClient.createUser({ name, email, password });

// Update user (Admin only)
const updatedUser = await apiClient.updateUser(userId, updateData);

// Delete user (Admin only)
await apiClient.deleteUser(userId);
```

## 🎯 Usage Examples

### Basic Authentication Flow

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await apiClient.login({ email, password });
      login(response.access_token, response.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Route Example

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` | Yes |
| `NEXT_PUBLIC_DEV_MODE` | Enable development mode | `false` | No |
| `NEXT_PUBLIC_DEBUG` | Enable debug logging | `false` | No |

### API Configuration

The API client automatically handles:
- JWT token management
- Request/response interceptors
- Error handling
- Base URL configuration

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Environment Setup**
   - Set `NEXT_PUBLIC_API_URL` to your production API URL
   - Set `NEXT_PUBLIC_DEV_MODE=false` for production
   - Configure any additional environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Authentication fails in production**
   - Check if `NEXT_PUBLIC_DEV_MODE=false`
   - Verify backend API is running and accessible
   - Check network requests in browser dev tools

2. **Streaming events not working**
   - Verify backend SSE endpoint is working (`/stream/ping`)
   - Check browser console for connection errors
   - Ensure JWT token is valid

3. **Orders not loading**
   - Verify user has proper permissions
   - Check API endpoint responses
   - Enable debug mode for detailed logging

### Debug Mode

Enable debug logging by setting `NEXT_PUBLIC_DEBUG=true`:

```env
NEXT_PUBLIC_DEBUG=true
```

This will log all API requests and responses to the browser console.

---

For more information about the backend API, see the [StreamFlow Backend README](../streamflow-backend/README.md). 