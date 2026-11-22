import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Album } from '../../models/album';
import { AlbumService } from '../../services/album.service';

@Component({
  selector: 'app-album-detail',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './album-detail.page.html',
  styleUrl: './album-detail.page.css',
})
export class AlbumDetailPage {
  private readonly albumService = inject(AlbumService);

  protected readonly album = signal<Album | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    const id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
    this.albumService.findById(id).subscribe({
      next: album => {
        this.album.set(album);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 404 || err.status === 400
          ? 'El álbum que buscas no existe'
          : 'No se pudo cargar el álbum. Intenta más tarde');
        this.loading.set(false);
      },
    });
  }
}
