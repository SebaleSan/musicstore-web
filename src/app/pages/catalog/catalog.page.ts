import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album } from '../../models/album';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-catalog',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './catalog.page.html',
  styleUrl: './catalog.page.css',
})
export class CatalogPage {
  private readonly albumService = inject(AlbumService);
  private readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  protected readonly albums = signal<Album[]>([]);
  protected readonly notice = signal<{ text: string; ok: boolean } | null>(null);
  private noticeTimer?: ReturnType<typeof setTimeout>;
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    return term
      ? this.albums().filter(album =>
          album.title.toLowerCase().includes(term) || album.artist.toLowerCase().includes(term))
      : this.albums();
  });

  constructor() {
    this.albumService.findAll().subscribe({
      next: albums => {
        this.albums.set(albums);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo. Intenta más tarde');
        this.loading.set(false);
      },
    });
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
