import { Injectable, computed, inject, linkedSignal } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { Order, ShippingInfo } from '../models/order';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly auth = inject(AuthService);
  private readonly storageKey = computed(() => {
    const username = this.auth.profile()?.username;
    return username ? `music-store-orders-${username}` : null;
  });

  private readonly history = linkedSignal<Order[]>(() => this.load(this.storageKey()));

  readonly orders = this.history.asReadonly();

  place(items: CartItem[], shipping: ShippingInfo): Order {
    const order: Order = {
      id: Date.now(),
      date: new Date().toISOString(),
      items,
      total: items.reduce((sum, item) => sum + item.album.price * item.quantity, 0),
      shipping,
    };
    this.save([order, ...this.history()]);
    return order;
  }

  private save(orders: Order[]): void {
    this.history.set(orders);
    const key = this.storageKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(orders));
    }
  }

  private load(key: string | null): Order[] {
    if (!key) {
      return [];
    }
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]');
    } catch {
      return [];
    }
  }
}
