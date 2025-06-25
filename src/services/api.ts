// API Configuration and Utilities
// Configure your API endpoints here

import Cookies from 'js-cookie';

export const API_CONFIG = {
  // REST API Base URL - para operações CRUD (Orders, Users, Auth)
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  
  // Streaming Base URL - para Server-Sent Events e WebSocket
  STREAM_BASE_URL: process.env.NEXT_PUBLIC_STREAM_URL || 'http://localhost:3001',
  
  // Authentication endpoints (REST API)
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
  },
  
  // Orders endpoints (REST API)
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    MY_ORDERS: '/orders/my-orders',
    BY_ID: (id: string) => `/orders/${id}`,
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
  },
  
  // Users endpoints (REST API)
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  
  // Stream endpoints (Streaming Service)
  STREAM: {
    EVENTS: '/stream', // Server-Sent Events endpoint
    PING: '/stream/ping',
    WEBSOCKET: '/ws', // WebSocket endpoint (para futuro uso)
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
    // Para cookies HttpOnly: o token NÃO pode ser lido via JavaScript
    // O cookie será enviado automaticamente via credentials: 'include'
    
    try {
      // Tenta ler apenas cookies acessíveis (não HttpOnly)
      if (typeof window !== 'undefined') {
        const token = Cookies.get('access_token');
        
        if (token && token !== 'undefined') {
          console.log('📤 Token acessível encontrado, enviando via header');
          return { Authorization: `Bearer ${token}` };
        }
      }
      
      // Se não conseguiu ler o token, significa que é HttpOnly
      // O navegador enviará automaticamente via credentials: 'include'
      console.log('🍪 Cookie HttpOnly será enviado automaticamente');
      return {};
      
    } catch (error) {
      console.log('🍪 Usando apenas credentials: include devido a erro');
      return {};
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    // Debug: Log da requisição para verificar se cookies estão sendo enviados
    console.log('🔍 Fazendo requisição para:', url);
    console.log('🍪 Credentials include:', config.credentials);
    console.log('📋 Headers:', config.headers);
    
    // Log dos cookies disponíveis
    if (typeof window !== 'undefined') {
      console.log('🍪 Cookies disponíveis:', document.cookie);
    }

    try {
      const response = await fetch(url, config);
      
      console.log('📨 Response status:', response.status);
      console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));
      
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
  async getOrders(params?: { page?: number; limit?: number; search?: string }): Promise<{ orders: Order[]; total: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);
      
      const queryString = searchParams.toString();
      const endpoint = queryString ? `${API_CONFIG.ORDERS.LIST}?${queryString}` : API_CONFIG.ORDERS.LIST;
      
      const result = await this.request<{ orders: Order[]; total: number }>(endpoint);
      return {
        orders: result.orders ?? [],
        total: result.total ?? result.orders?.length ?? 0,
      };
    } catch (error) {
      console.error('getOrders error:', error);
      return { orders: [], total: 0 };
    }
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
    // Ping direto na URL de streaming (não na API REST)
    const streamUrl = `${API_CONFIG.STREAM_BASE_URL}${API_CONFIG.STREAM.PING}`;
    
    console.log('🏓 Attempting to ping stream service...');
    console.log('🏓 Stream URL:', streamUrl);
    console.log('🏓 API_CONFIG.STREAM_BASE_URL:', API_CONFIG.STREAM_BASE_URL);
    console.log('🏓 API_CONFIG.STREAM.PING:', API_CONFIG.STREAM.PING);
    
    const authHeaders = this.getAuthHeaders();
    console.log('🔑 Auth headers:', Object.keys(authHeaders));
    
    const response = await fetch(streamUrl, {
      method: 'GET',
      credentials: 'include', // Para enviar HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });
    
    console.log('🏓 Ping response status:', response.status);
    console.log('🏓 Ping response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('🏓 Stream service ping failed:', response.status, response.statusText);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error('🏓 Error response body:', errorText);
      throw new Error(`Stream service ping failed: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json() as Promise<{ message: string; timestamp: string; status: string }>;
    console.log('🏓 Stream service ping successful:', result);
    
    return result;
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Server-Sent Events utility
export class StreamEventSource {
  private eventSource: EventSource | null = null;
  private url: string;

  constructor(endpoint: string = API_CONFIG.STREAM.EVENTS) {
    // Use a URL de streaming separada para SSE
    this.url = `${API_CONFIG.STREAM_BASE_URL}${endpoint}`;
    console.log('🔧 StreamEventSource initialized with URL:', this.url);
    console.log('🔧 API_CONFIG.STREAM_BASE_URL:', API_CONFIG.STREAM_BASE_URL);
    console.log('🔧 API_CONFIG.STREAM.EVENTS:', API_CONFIG.STREAM.EVENTS);
  }

  connect(
    onMessage: (event: MessageEvent) => void,
    onError?: (error: Event) => void,
    onOpen?: (event: Event) => void,
    options?: { type?: string; userOnly?: boolean }
  ): void {
    try {
      console.log('🚀 Attempting to connect to stream...');
      console.log('🚀 Connection options:', options);
      
      // Add auth token and parameters to URL for SSE
      const token = Cookies.get('access_token');
      console.log('🔑 Auth token available:', !!token);
      if (token) {
        console.log('🔑 Token length:', token.length);
        console.log('🔑 Token preview:', token.substring(0, 20) + '...');
      }
      
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
      console.log('🌐 Final SSE URL:', urlWithParams);
      
      console.log('🔧 Creating EventSource...');
      this.eventSource = new EventSource(urlWithParams);
      
      this.eventSource.onopen = (event) => {
        console.log('✅ Stream connected successfully!');
        console.log('✅ EventSource readyState:', this.eventSource?.readyState);
        console.log('✅ EventSource URL:', this.eventSource?.url);
        onOpen?.(event);
      };
      
      this.eventSource.onmessage = (event) => {
        console.log('📨 Raw SSE message received:');
        console.log('📨 Event type:', event.type);
        console.log('📨 Event data length:', event.data?.length);
        console.log('📨 Event data preview:', event.data?.substring(0, 100) + '...');
        onMessage(event);
      };
      
      this.eventSource.onerror = (error) => {
        console.error('❌ Stream error occurred:');
        console.error('❌ Error type:', error.type);
        console.error('❌ Error target:', error.target);
        console.error('❌ EventSource readyState:', this.eventSource?.readyState);
        console.error('❌ EventSource URL:', this.eventSource?.url);
        
        // Log more details about the error
        if (error.target instanceof EventSource) {
          console.error('❌ EventSource readyState:', error.target.readyState);
          console.error('❌ EventSource URL:', error.target.url);
        }
        
        onError?.(error);
      };
      
      console.log('🔧 EventSource created, waiting for connection...');
    } catch (error) {
      console.error('💥 Failed to create EventSource:', error);
      console.error('💥 Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      onError?.(error as Event);
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      console.log('🔌 Disconnecting from stream...');
      console.log('🔌 EventSource readyState before disconnect:', this.eventSource.readyState);
      this.eventSource.close();
      this.eventSource = null;
      console.log('🔌 Stream disconnected');
    } else {
      console.log('🔌 No active connection to disconnect');
    }
  }

  getReadyState(): number {
    const state = this.eventSource?.readyState ?? EventSource.CLOSED;
    console.log('📊 Current readyState:', state);
    return state;
  }

  isConnected(): boolean {
    const connected = this.eventSource?.readyState === EventSource.OPEN;
    console.log('🔗 Connection status:', connected);
    return connected;
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