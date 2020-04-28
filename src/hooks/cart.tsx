import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const allProducts = await AsyncStorage.getItem('@GoMarketplace:products');

      if (allProducts) {
        setProducts(JSON.parse(allProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      if (!products.find(({ id }) => id === product.id)) {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      } else {
        const newQuant = products.map(prod =>
          prod.id === product.id
            ? { ...prod, quantity: prod.quantity += 1 }
            : { ...prod },
        );
        setProducts(newQuant);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newQuant),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newQuant = products.map(prod =>
        prod.id === id
          ? { ...prod, quantity: prod.quantity += 1 }
          : { ...prod },
      );
      setProducts(newQuant);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newQuant),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newQuant = products.map(prod =>
        prod.id === id
          ? { ...prod, quantity: prod.quantity -= 1 }
          : { ...prod },
      );
      setProducts(newQuant);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newQuant),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
