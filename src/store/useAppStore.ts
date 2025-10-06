import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, OrderStatus, ItemStatus, User, Language, MenuItem, MenuCategory, Fruit, APICategoryResponse } from '@/types';

interface AppState {
  // Language
  language: Language;
  setLanguage: (language: Language) => void;
  
  // Users
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  loadUsersFromAPI: () => Promise<void>;
  
  // Tables
  tables: Array<{ id: string; name: string }>;
  loadTablesFromAPI: () => Promise<void>;
  
  // Menu
  menuCategories: MenuCategory[];
  setMenuCategories: (categories: MenuCategory[]) => void;
  loadMenuCategoriesFromAPI: () => Promise<void>;
  
  // Fruits
  fruits: Fruit[];
  loadFruitsFromAPI: () => Promise<void>;
  
  // Orders
  orders: Order[];
  currentOrder: Order | null;
  
  // Order management
  createOrder: (tableNumber: number, waiterId: string, waiterName: string, todoJunto?: boolean) => void;
  addItemToOrder: (menuItem: MenuItem, customizations: string[], customText?: string) => void;
  setOrderTodoJunto: (todoJunto: boolean) => void;
  confirmOrder: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  markOrderAsPaid: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  
  // Getters
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByTable: (tableNumber: number) => Order[];
  getConfirmedOrders: () => Order[];
  getActiveOrders: () => Order[];
  getPaidOrders: () => Order[];
  getOrdersByDateRange: (startDate: Date, endDate: Date) => Order[];
  
  // Reset
  resetCurrentOrder: () => void;
}

// Default users
const defaultUsers: User[] = [
  { id: '1', name: 'Maria García', role: 'WAITER' },
  { id: '2', name: 'Carlos López', role: 'WAITER' },
  { id: '3', name: 'Ana Martínez', role: 'KITCHEN' },
  { id: '4', name: 'José Rodríguez', role: 'KITCHEN' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Language
      language: 'es',
      setLanguage: (language) => set({ language }),
      
      // Users
      users: defaultUsers,
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      loadUsersFromAPI: async () => {
        try {
          const { users } = await import('@/services/api').then(mod => mod.default.getUsers());
          set({ users });
        } catch (error) {
          console.error('Failed to load users from API:', error);
          // Keep default users if API fails
        }
      },
      
      // Tables
      tables: [],
      loadTablesFromAPI: async () => {
        try {
          const { tables } = await import('@/services/api').then(mod => mod.default.getTables());
          set({ tables });
        } catch (error) {
          console.error('Failed to load tables from API:', error);
        }
      },
      
      // Menu
      menuCategories: [],
      setMenuCategories: (categories) => set({ menuCategories: categories }),
      loadMenuCategoriesFromAPI: async () => {
        try {
          console.log('Loading menu categories from API...');
          const { categories }: { categories: APICategoryResponse[] } = await import('@/services/api').then(mod => mod.default.getMenuCategories());
          console.log('Raw categories from API:', categories);
          // Transform API categories to match frontend interface
          const transformedCategories: MenuCategory[] = categories.map(apiCategory => ({
            id: apiCategory.id,
            name: {
              es: apiCategory.name_es || apiCategory.id,
              en: apiCategory.name_en || apiCategory.id,
            },
            items: [], // Items will be loaded when category is selected
            defaultCustomizations: apiCategory.default_customizations || []
          }));
          console.log('Transformed categories for frontend:', transformedCategories);
          set({ menuCategories: transformedCategories });
        } catch (error) {
          console.error('Failed to load menu categories from API:', error);
        }
      },
      
      // Fruits
      fruits: [],
      loadFruitsFromAPI: async () => {
        try {
          const { fruits } = await import('@/services/api').then(mod => mod.default.getFruits());
          set({ fruits });
        } catch (error) {
          console.error('Failed to load fruits from API:', error);
        }
      },
      
      // Orders
      orders: [],
      currentOrder: null,
      
      // Order management
      createOrder: (tableNumber, waiterId, waiterName, todoJunto = false) => {
        const newOrder: Order = {
          id: uuidv4(),
          tableNumber,
          waiterId,
          waiterName,
          items: [],
          status: 'TO_CONFIRM',
          todoJunto,
          createdAt: new Date(),
        };
        set({ currentOrder: newOrder });
      },
      
      setOrderTodoJunto: (todoJunto) => {
        set(state => ({
          currentOrder: state.currentOrder ? {
            ...state.currentOrder,
            todoJunto
          } : null
        }));
      },
      
      addItemToOrder: (menuItem, customizations, customText) => {
        const currentOrder = get().currentOrder;
        if (!currentOrder) return;
        
        const newItem: OrderItem = {
          id: uuidv4(),
          menuItemId: menuItem.id,
          menuItem,
          customizations: customizations.map((text, index) => ({
            id: uuidv4(),
            text,
            frequency: 0, // Will be updated based on usage
          })),
          customText,
          status: 'TO_PREPARE',
          timestamp: new Date(),
        };
        
        const updatedOrder = {
          ...currentOrder,
          items: [...currentOrder.items, newItem],
        };
        
        set({ currentOrder: updatedOrder });
      },
      
      confirmOrder: () => {
        const currentOrder = get().currentOrder;
        const orders = get().orders;
        
        if (!currentOrder || currentOrder.items.length === 0) return;
        
        const confirmedOrder: Order = {
          ...currentOrder,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        };
        
        set({
          orders: [...orders, confirmedOrder],
          currentOrder: null,
        });
      },
      
      updateOrderStatus: (orderId, status) => {
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id === orderId) {
              const updatedOrder = { ...order, status };
              if (status === 'PREPARED') {
                updatedOrder.preparedAt = new Date();
              } else if (status === 'PAGADO') {
                updatedOrder.paidAt = new Date();
              }
              return updatedOrder;
            }
            return order;
          });
          return { orders: newOrders };
        });
      },
      
      markOrderAsPaid: (orderId) => {
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId 
              ? { ...order, status: 'PAGADO' as OrderStatus, paidAt: new Date() }
              : order
          )
        }));
      },
      
      updateItemStatus: (orderId, itemId, status) => {
        set(state => ({
          orders: state.orders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.map(item => 
                item.id === itemId ? { ...item, status } : item
              );
              
              // Check if all items are prepared to update order status
              const allItemsPrepared = updatedItems.every(item => 
                item.status === 'PREPARED' || item.status === 'CANCELED'
              );
              
              const hasAtLeastOnePrepared = updatedItems.some(item => 
                item.status === 'PREPARED'
              );
              
              let orderStatus = order.status;
              if (allItemsPrepared && hasAtLeastOnePrepared && order.status === 'CONFIRMED') {
                orderStatus = 'PREPARED';
              }
              
              return {
                ...order,
                items: updatedItems,
                status: orderStatus,
                preparedAt: orderStatus === 'PREPARED' ? new Date() : order.preparedAt,
              };
            }
            return order;
          })
        }));
      },
      
      cancelOrder: (orderId) => {
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, status: 'CANCELED' } : order
          )
        }));
      },
      
      // Getters
      getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
      },
      
      getOrdersByTable: (tableNumber) => {
        return get().orders.filter(order => order.tableNumber === tableNumber);
      },
      
      getConfirmedOrders: () => {
        return get().orders
          .filter(order => order.status === 'CONFIRMED')
          .sort((a, b) => new Date(a.confirmedAt || a.createdAt).getTime() - new Date(b.confirmedAt || b.createdAt).getTime());
      },
      
      getActiveOrders: () => {
        return get().orders.filter(order => 
          order.status !== 'PAGADO' && order.status !== 'CANCELED'
        );
      },
      
      getPaidOrders: () => {
        return get().orders
          .filter(order => order.status === 'PAGADO')
          .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime());
      },
      
      getOrdersByDateRange: (startDate, endDate) => {
        return get().orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      resetCurrentOrder: () => set({ currentOrder: null }),
    }),
    {
      name: 'sfc-order-storage',
      partialize: (state) => ({
        language: state.language,
        // Don't persist users or menuCategories - always fetch from API
        // users: state.users,
        // menuCategories: state.menuCategories,
        orders: state.orders,
      }),
    }
  )
);