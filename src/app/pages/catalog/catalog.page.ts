import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album } from '../../models/album';
import { AlbumService } from '../../services/album.service';

@Component({
  selector: 'app-catalog',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './catalog.page.html',
  styleUrl: './catalog.page.css',
})
export class CatalogPage {
  private readonly albumService = inject(AlbumService);

  protected readonly albums = signal<Album[]>([]);
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
}
