// API Configuration and Utilities
// Configure your API endpoints here

export const API_CONFIG = {
  // Base API URL - update this to match your backend
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
  },
  
  // Orders endpoints
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    MY_ORDERS: '/orders/my-orders',
    BY_ID: (id: string) => `/orders/${id}`,
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
  },
  
  // Users endpoints
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  
  // Stream endpoints
  STREAM: {
    EVENTS: '/stream', // Server-Sent Events endpoint
    PING: '/stream/ping',
  },
};

// Order types
export interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  customer: string;
  product: string;
  quantity: number;
  price: number;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  title: string;
  description?: string;
  amount: number;
  userId: string;
}

export interface UpdateOrderDto {
  customer?: string;
  product?: string;
  quantity?: number;
  price?: number;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  title?: string;
  description?: string;
  amount?: number;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

// Stream types
export interface StreamEvent {
  id: string;
  timestamp: string;
  eventType: 'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING';
  userId: string;
  action: string;
  value: number;
  location: string;
  createdAt: string;
}

// API utility functions
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(loginData: LoginDto) {
    return this.request<{ access_token: string; user: User }>(API_CONFIG.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async register(registerData: RegisterDto) {
    return this.request<{ access_token: string; user: User }>(API_CONFIG.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  }

  async verifyToken() {
    return this.request<{ user: User; message: string }>(API_CONFIG.AUTH.VERIFY, {
      method: 'POST',
    });
  }

  // Orders methods
  async getOrders(params?: { page?: number; limit?: number; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ORDERS.LIST}?${queryString}` : API_CONFIG.ORDERS.LIST;
    
    return this.request<Order[]>(endpoint);
  }

  async getMyOrders() {
    return this.request<Order[]>(API_CONFIG.ORDERS.MY_ORDERS);
  }

  async createOrder(orderData: CreateOrderDto) {
    return this.request<Order>(API_CONFIG.ORDERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id: string) {
    return this.request<Order>(API_CONFIG.ORDERS.BY_ID(id));
  }

  async updateOrder(id: string, orderData: UpdateOrderDto) {
    return this.request<Order>(API_CONFIG.ORDERS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string) {
    return this.request<{ message: string }>(API_CONFIG.ORDERS.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Users methods
  async getUsers() {
    return this.request<User[]>(API_CONFIG.USERS.LIST);
  }

  async getUser(id: string) {
    return this.request<User>(API_CONFIG.USERS.BY_ID(id));
  }

  async createUser(userData: RegisterDto) {
    return this.request<User>(API_CONFIG.USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<RegisterDto>) {
    return this.request<User>(API_CONFIG.USERS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(API_CONFIG.USERS.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Stream methods
  async pingStream() {
    return this.request<{ message: string; timestamp: string; status: string }>(API_CONFIG.STREAM.PING);
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Server-Sent Events utility
export class StreamEventSource {
  private eventSource: EventSource | null = null;
  private url: string;

  constructor(endpoint: string = API_CONFIG.STREAM.EVENTS) {
    this.url = `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  connect(
    onMessage: (event: MessageEvent) => void,
    onError?: (error: Event) => void,
    onOpen?: (event: Event) => void,
    options?: { type?: string; userOnly?: boolean }
  ): void {
    try {
      // Add auth token and parameters to URL for SSE
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      
      if (token) {
        params.append('token', token);
      }
      
      if (options?.type) {
        params.append('type', options.type);
      }
      
      if (options?.userOnly) {
        params.append('userOnly', 'true');
      }
      
      const urlWithParams = params.toString() ? `${this.url}?${params.toString()}` : this.url;
      
      this.eventSource = new EventSource(urlWithParams);
      
      this.eventSource.onopen = (event) => {
        console.log('Stream connected');
        onOpen?.(event);
      };
      
      this.eventSource.onmessage = onMessage;
      
      this.eventSource.onerror = (error) => {
        console.error('Stream error:', error);
        onError?.(error);
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      onError?.(error as Event);
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('Stream disconnected');
    }
  }

  getReadyState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED;
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Environment validation
export function validateApiConfig(): boolean {
  const requiredEnvVars = ['NEXT_PUBLIC_API_URL'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Using default API configuration. Set NEXT_PUBLIC_API_URL in your .env.local file');
    return false;
  }
  
  return true;
} 