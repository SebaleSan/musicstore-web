import { CartItem } from './cart-item';

export interface Order {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
}
