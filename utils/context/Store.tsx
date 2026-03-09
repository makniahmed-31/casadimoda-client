"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useReducer,
  useEffect,
} from "react";
import Cookies from "js-cookie";

// 1. Define types
import { CartItem } from "@/types";

interface CartState {
  cartItems: CartItem[];
}

interface StoreState {
  cart: CartState;
}

type Action =
  | { type: "CART_ADD_ITEM"; payload: CartItem }
  | { type: "CART_REMOVE_ITEM"; payload: { slug: string } }
  | { type: "CART_RESET" }
  | { type: "CART_HYDRATE"; payload: CartItem[] };

// 2. Initial State
const initialState: StoreState = {
  cart: {
    cartItems: [],
  },
};

// 3. Create Context
const StoreContext = createContext<
  | {
      state: StoreState;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

// 4. Reducer
function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "CART_HYDRATE": {
      return { ...state, cart: { ...state.cart, cartItems: action.payload } };
    }
    case "CART_ADD_ITEM": {
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item.slug === newItem.slug
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item.slug === existItem.slug ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      Cookies.set("cart", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) => item.slug !== action.payload.slug
      );
      Cookies.set("cart", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "CART_RESET":
      Cookies.remove("cart");
      return {
        ...state,
        cart: {
          cartItems: [],
        },
      };
    default:
      return state;
  }
}

// 5. Context Provider
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const savedCart = Cookies.get("cart");
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: "CART_HYDRATE", payload: cartItems });
      } catch (error) {
        console.error("Failed to parse cart from cookies", error);
      }
    }
  }, []);

  const value = { state, dispatch };
  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

// 6. Custom Hook
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
