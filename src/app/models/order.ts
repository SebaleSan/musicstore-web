import { CartItem } from './cart-item';

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

export interface Order {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
  shipping: ShippingInfo;
}
