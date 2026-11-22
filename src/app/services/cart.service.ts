import { Injectable, computed, inject, linkedSignal } from '@angular/core';
import { Album } from '../models/album';
import { CartItem } from '../models/cart-item';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly auth = inject(AuthService);
  private readonly storageKey = computed(() => {
    const username = this.auth.profile()?.username;
    return username ? `music-store-cart-${username}` : null;
  });

  private readonly cart = linkedSignal<CartItem[]>(() => this.load(this.storageKey()));

  readonly items = this.cart.asReadonly();
  readonly count = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() => this.cart().reduce((sum, item) => sum + item.album.price * item.quantity, 0));

  add(album: Album): boolean {
    const current = this.cart().find(item => item.album.idAlbum === album.idAlbum);
    const quantity = (current?.quantity ?? 0) + 1;
    if (quantity > album.stock) {
      return false;
    }
    this.save(current
      ? this.cart().map(item => item.album.idAlbum === album.idAlbum ? { album, quantity } : item)
      : [...this.cart(), { album, quantity }]);
    return true;
  }

  setQuantity(idAlbum: number, quantity: number): void {
    this.save(this.cart().map(item => item.album.idAlbum === idAlbum
      ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.album.stock) }
      : item));
  }

  remove(idAlbum: number): void {
    this.save(this.cart().filter(item => item.album.idAlbum !== idAlbum));
  }

  clear(): void {
    this.save([]);
  }

  private save(items: CartItem[]): void {
    this.cart.set(items);
    const key = this.storageKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(items));
    }
  }

  private load(key: string | null): CartItem[] {
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
