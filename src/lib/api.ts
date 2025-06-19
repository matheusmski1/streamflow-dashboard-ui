// API Configuration and Utilities
// Configure your API endpoints here

export const API_CONFIG = {
  // Base API URL - update this to match your backend
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
  },
  
  // Stream endpoints
  STREAM: {
    EVENTS: '/stream/events', // Server-Sent Events endpoint
    STATS: '/stream/stats',
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    PERFORMANCE: '/analytics/performance',
    ENGAGEMENT: '/analytics/engagement',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
  }
};

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
  async login(email: string, password: string) {
    return this.request(API_CONFIG.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request(API_CONFIG.AUTH.LOGOUT, {
      method: 'POST',
    });
  }

  async verifyToken() {
    return this.request(API_CONFIG.AUTH.VERIFY);
  }

  async refreshToken() {
    return this.request(API_CONFIG.AUTH.REFRESH, {
      method: 'POST',
    });
  }

  // Analytics methods
  async getAnalyticsDashboard() {
    return this.request(API_CONFIG.ANALYTICS.DASHBOARD);
  }

  async getPerformanceMetrics() {
    return this.request(API_CONFIG.ANALYTICS.PERFORMANCE);
  }

  async getEngagementMetrics() {
    return this.request(API_CONFIG.ANALYTICS.ENGAGEMENT);
  }

  // Stream methods
  async getStreamStats() {
    return this.request(API_CONFIG.STREAM.STATS);
  }

  // User methods
  async getUserProfile() {
    return this.request(API_CONFIG.USER.PROFILE);
  }

  async updateUserSettings(settings: Record<string, unknown>) {
    return this.request(API_CONFIG.USER.SETTINGS, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
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
    onOpen?: (event: Event) => void
  ): void {
    try {
      // Add auth token to URL for SSE
      const token = localStorage.getItem('auth_token');
      const urlWithAuth = token ? `${this.url}?token=${token}` : this.url;
      
      this.eventSource = new EventSource(urlWithAuth);
      
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