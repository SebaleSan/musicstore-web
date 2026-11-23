import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album } from '../../models/album';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage {
  private readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  private readonly albums = signal<Album[]>([]);
  protected readonly loading = signal(true);
  protected readonly featured = computed(() => this.albums().filter(album => album.coverArt).slice(0, 5));
  protected readonly latest = computed(() => [...this.albums()].sort((a, b) => b.idAlbum - a.idAlbum).slice(0, 8));

  protected readonly current = signal(0);
  protected readonly paused = signal(false);
  protected readonly notice = signal<{ text: string; ok: boolean } | null>(null);
  private noticeTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(AlbumService).findAll().subscribe({
      next: albums => {
        this.albums.set(albums);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = setInterval(() => {
        if (!this.paused()) {
          this.next();
        }
      }, 5000);
      inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }
  }

  protected next(): void {
    const total = this.featured().length;
    if (total) {
      this.current.update(index => (index + 1) % total);
    }
  }

  protected previous(): void {
    const total = this.featured().length;
    if (total) {
      this.current.update(index => (index - 1 + total) % total);
    }
  }

  protected addToCart(album: Album): void {
    const added = this.cart.add(album);
    this.notice.set(added
      ? { text: `"${album.title}" se agregó al carrito`, ok: true }
      : { text: `No hay más stock disponible de "${album.title}"`, ok: false });
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.notice.set(null), 3000);
  }
}
