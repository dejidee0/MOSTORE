import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  // State
  items: [],

  // Actions
  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({
        items: [...items, { ...product, quantity: 1 }],
      });
    }
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
    } else {
      set((state) => ({
        items: state.items.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        ),
      }));
    }
  },

  clearCart: () => {
    set({ items: [] });
  },
}));

export { useCartStore };