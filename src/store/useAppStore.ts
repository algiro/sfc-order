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
  lastOrderSync: Date | null;
  
  // Order API integration
  loadOrdersFromAPI: () => Promise<void>;
  syncOrders: () => Promise<void>;
  
  // Order management
  createOrder: (tableNumber: number, waiterId: string, waiterName: string, todoJunto?: boolean) => void;
  addItemToOrder: (menuItem: MenuItem, customizations: string[], customText?: string) => void;
  setOrderTodoJunto: (todoJunto: boolean) => void;
  confirmOrder: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => Promise<void>;
  markOrderAsPaid: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  
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
      lastOrderSync: null,
      
      // Order API integration
      loadOrdersFromAPI: async () => {
        try {
          console.log('Loading orders from API...');
          const { orders } = await import('@/services/api').then(mod => mod.default.getOrders());
          console.log('Loaded orders from API:', orders);
          set({ orders, lastOrderSync: new Date() });
        } catch (error) {
          console.error('Failed to load orders from API:', error);
        }
      },
      
      syncOrders: async () => {
        try {
          // Load fresh orders from API
          const { orders } = await import('@/services/api').then(mod => mod.default.getOrders());
          set({ orders, lastOrderSync: new Date() });
        } catch (error) {
          console.error('Failed to sync orders from API:', error);
        }
      },
      
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
      
      confirmOrder: async () => {
        const currentOrder = get().currentOrder;
        const orders = get().orders;
        
        if (!currentOrder || currentOrder.items.length === 0) return;
        
        try {
          // Prepare order data for API
          const orderData = {
            tableNumber: currentOrder.tableNumber,
            waiterId: currentOrder.waiterId,
            waiterName: currentOrder.waiterName,
            todoJunto: currentOrder.todoJunto,
            items: currentOrder.items.map(item => ({
              menuItemId: item.menuItemId,
              menuItem: item.menuItem,
              customizations: item.customizations?.map(c => c.text) || [],
              customText: item.customText,
            })),
          };
          
          // Save order to API
          const { orderId } = await import('@/services/api').then(mod => mod.default.createOrder(orderData));
          
          const confirmedOrder: Order = {
            ...currentOrder,
            id: orderId, // Use the ID returned from API
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          };
          
          set({
            orders: [...orders, confirmedOrder],
            currentOrder: null,
          });
          
          console.log('Order confirmed and saved to API:', orderId);
        } catch (error) {
          console.error('Failed to confirm order:', error);
          // For now, still save locally even if API fails
          const confirmedOrder: Order = {
            ...currentOrder,
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          };
          
          set({
            orders: [...orders, confirmedOrder],
            currentOrder: null,
          });
        }
      },
      
      updateOrderStatus: async (orderId, status) => {
        try {
          // Update status via API
          await import('@/services/api').then(mod => mod.default.updateOrderStatus(orderId, status));
          
          // Update local state
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
          
          console.log('Order status updated:', orderId, status);
        } catch (error) {
          console.error('Failed to update order status:', error);
          // Still update locally even if API fails
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
        }
      },
      
      markOrderAsPaid: async (orderId) => {
        try {
          // Update status via API
          await import('@/services/api').then(mod => mod.default.updateOrderStatus(orderId, 'PAGADO'));
          
          // Update local state
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId 
                ? { ...order, status: 'PAGADO' as OrderStatus, paidAt: new Date() }
                : order
            )
          }));
          
          console.log('Order marked as paid:', orderId);
        } catch (error) {
          console.error('Failed to mark order as paid:', error);
          // Still update locally even if API fails
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId 
                ? { ...order, status: 'PAGADO' as OrderStatus, paidAt: new Date() }
                : order
            )
          }));
        }
      },
      
      updateItemStatus: async (orderId, itemId, status) => {
        try {
          // Update item status via API
          await import('@/services/api').then(mod => mod.default.updateItemStatus(orderId, itemId, status));
          
          // Update local state
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
          
          console.log('Item status updated:', orderId, itemId, status);
        } catch (error) {
          console.error('Failed to update item status:', error);
          // Still update locally even if API fails
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
        }
      },
      
      cancelOrder: async (orderId) => {
        try {
          // Cancel order via API
          await import('@/services/api').then(mod => mod.default.cancelOrder(orderId));
          
          // Update local state
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId ? { ...order, status: 'CANCELED' } : order
            )
          }));
          
          console.log('Order canceled:', orderId);
        } catch (error) {
          console.error('Failed to cancel order:', error);
          // Still update locally even if API fails
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId ? { ...order, status: 'CANCELED' } : order
            )
          }));
        }
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
        // Don't persist orders, users, or menuCategories - always fetch from API
        // orders: state.orders,
        // users: state.users,
        // menuCategories: state.menuCategories,
      }),
    }
  )
);