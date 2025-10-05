// Order Status State Machine
export type OrderStatus = 'TO_CONFIRM' | 'CONFIRMED' | 'PREPARED' | 'PAGADO' | 'MODIFIED' | 'CANCELED';

// Item Status State Machine
export type ItemStatus = 'TO_PREPARE' | 'PREPARING' | 'PREPARED' | 'CANCELED';

// User roles
export type UserRole = 'WAITER' | 'KITCHEN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface MenuItem {
  id: string;
  name: {
    es: string;
    en: string;
  };
  price: number;
  category: string;
  customizations?: string[];
}

export interface OrderItemCustomization {
  id: string;
  text: string;
  frequency: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  customizations: OrderItemCustomization[];
  customText?: string;
  status: ItemStatus;
  timestamp: Date;
}

export interface Order {
  id: string;
  tableNumber: number;
  waiterName: string;
  waiterId: string;
  items: OrderItem[];
  status: OrderStatus;
  todoJunto: boolean; // All items must be served at the same time
  createdAt: Date;
  confirmedAt?: Date;
  preparedAt?: Date;
  paidAt?: Date;
}

// Language support
export type Language = 'es' | 'en';

// Navigation types
export type MainSection = 'TOMAR' | 'LISTA' | 'MESAS' | 'ARCHIVO';

export interface MenuCategory {
  id: string;
  name: {
    es: string;
    en: string;
  };
  items: MenuItem[];
  defaultCustomizations: string[];
}

// State machine transitions
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  TO_CONFIRM: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['PREPARED', 'MODIFIED', 'CANCELED'],
  PREPARED: ['PAGADO'],
  PAGADO: [],
  MODIFIED: ['CONFIRMED', 'CANCELED'],
  CANCELED: [],
};

export const ITEM_STATUS_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  TO_PREPARE: ['PREPARING', 'CANCELED'],
  PREPARING: ['PREPARED', 'CANCELED'],
  PREPARED: [],
  CANCELED: [],
};