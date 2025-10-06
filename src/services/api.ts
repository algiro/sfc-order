import { Order, OrderItem, User, MenuItem, MenuCategory, Fruit, APICategoryResponse, APIItemResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Orders API
  async getOrders(filters?: {
    status?: string;
    tableNumber?: number;
    date?: string;
    waiterId?: string;
  }): Promise<{ orders: Order[] }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key === 'tableNumber' ? 'table_number' : 
                       key === 'waiterId' ? 'waiter_id' : key, 
                       value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    return this.request<{ orders: Order[] }>(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(id: string): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/orders/${id}`);
  }

  async createOrder(orderData: {
    tableNumber: number;
    waiterId: string;
    waiterName: string;
    todoJunto?: boolean;
    items: Array<{
      menuItemId: string;
      menuItem: MenuItem;
      customizations?: string[];
      customText?: string;
    }>;
  }): Promise<{ orderId: string }> {
    return this.request<{ orderId: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateItemStatus(orderId: string, itemId: string, status: OrderItem['status']): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${orderId}/items/${itemId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async cancelOrder(orderId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getUsers(): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>('/users');
  }

  async getUser(id: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/users/${id}`);
  }

  async createUser(userData: {
    name: string;
    role: User['role'];
  }): Promise<{ id: string }> {
    return this.request<{ id: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Menu API
  async getMenuCategories(): Promise<{ categories: APICategoryResponse[] }> {
    return this.request<{ categories: APICategoryResponse[] }>('/menu/categories');
  }

  async getMenuItems(categoryId?: string): Promise<{ items: MenuItem[] }> {
    const endpoint = categoryId ? `/menu/items/${categoryId}` : '/menu/items';
    const response = await this.request<{ items: APIItemResponse[] }>(endpoint);
    
    // Transform API response to frontend format
    const transformedItems: MenuItem[] = response.items.map(apiItem => ({
      id: apiItem.id,
      name: {
        es: apiItem.name_es,
        en: apiItem.name_en,
      },
      price: apiItem.price,
      category: apiItem.category_id,
      customizations: [],
      description: apiItem.description_es && apiItem.description_en ? {
        es: apiItem.description_es,
        en: apiItem.description_en,
      } : undefined,
      available: apiItem.available,
      customization_type: apiItem.customization_type,
      predefined_recipe: apiItem.predefined_recipe,
    }));
    
    return { items: transformedItems };
  }

  async updateItemAvailability(itemId: string, available: boolean): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/menu/items/${itemId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ available }),
    });
  }

  // Tables API
  async getTables(): Promise<{ tables: Array<{ id: string; name: string }> }> {
    const tables = await this.request<Array<{ id: string; name: string }>>('/tables');
    return { tables };
  }

  async getTable(id: string): Promise<{ table: { id: string; name: string } }> {
    const table = await this.request<{ id: string; name: string }>(`/tables/${id}`);
    return { table };
  }

  async createTable(tableData: {
    id: string;
    name: string;
  }): Promise<{ id: string }> {
    return this.request<{ id: string }>('/tables', {
      method: 'POST',
      body: JSON.stringify(tableData),
    });
  }

  async updateTable(id: string, tableData: { name: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tableData),
    });
  }

  async deleteTable(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tables/${id}`, {
      method: 'DELETE',
    });
  }

  // Fruits API
  async getFruits(): Promise<{ fruits: Fruit[] }> {
    return this.request<{ fruits: Fruit[] }>('/fruits');
  }

  // Analytics API
  async getAnalyticsSummary(date?: string): Promise<{
    date: string;
    summary: {
      total_orders: number;
      paid_orders: number;
      canceled_orders: number;
      total_revenue: number;
    };
    popularItems: Array<{
      item_name: string;
      order_count: number;
      total_revenue: number;
    }>;
    hourlyOrders: Array<{
      hour: number;
      order_count: number;
    }>;
    tableUsage: Array<{
      table_number: number;
      order_count: number;
      revenue: number;
    }>;
    waiterPerformance: Array<{
      waiter_name: string;
      orders_taken: number;
      revenue_generated: number;
      avg_prep_time_minutes: number | null;
    }>;
  }> {
    const params = date ? `?date=${date}` : '';
    return this.request(`/analytics/summary${params}`);
  }

  async getAnalyticsTrends(startDate: string, endDate: string): Promise<{
    startDate: string;
    endDate: string;
    trends: Array<{
      date: string;
      total_orders: number;
      paid_orders: number;
      daily_revenue: number;
      avg_prep_time_minutes: number | null;
    }>;
  }> {
    return this.request(`/analytics/trends?startDate=${startDate}&endDate=${endDate}`);
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage?: (data: any) => void): WebSocket | null {
    try {
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        // Subscribe to order updates
        ws.send(JSON.stringify({ type: 'subscribe', channels: ['orders'] }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
      
      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  }
}

export const apiService = new APIService();
export default apiService;