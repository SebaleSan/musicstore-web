import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Album, AlbumRequest } from '../../models/album';
import { AlbumService } from '../../services/album.service';

type Field = 'artist' | 'title' | 'year' | 'genre' | 'price' | 'stock' | 'coverArt';

const MESSAGES: Record<Field, Record<string, string>> = {
  artist: { required: 'El artista es obligatorio', maxlength: 'Máximo 120 caracteres' },
  title: { required: 'El título es obligatorio', maxlength: 'Máximo 150 caracteres' },
  year: { min: 'El año debe ser 1900 o posterior', max: 'El año no puede ser mayor a 2100', pattern: 'Ingresa un año válido' },
  genre: { required: 'El género es obligatorio', maxlength: 'Máximo 60 caracteres' },
  price: { required: 'El precio es obligatorio', min: 'El precio no puede ser negativo', pattern: 'Ingresa un número entero' },
  stock: { required: 'El stock es obligatorio', min: 'El stock no puede ser negativo', pattern: 'Ingresa un número entero' },
  coverArt: { maxlength: 'Máximo 255 caracteres' },
};

@Component({
  selector: 'app-admin-albums',
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './admin-albums.page.html',
  styleUrl: './admin-albums.page.css',
})
export class AdminAlbumsPage {
  private readonly albumService = inject(AlbumService);

  protected readonly albums = signal<Album[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly message = signal<{ text: string; ok: boolean; fields?: string[] } | null>(null);

  protected readonly form = inject(FormBuilder).group({
    artist: ['', [Validators.required, Validators.maxLength(120)]],
    title: ['', [Validators.required, Validators.maxLength(150)]],
    year: [null as number | null, [Validators.min(1900), Validators.max(2100), Validators.pattern(/^\d{4}$/)]],
    genre: ['', [Validators.required, Validators.maxLength(60)]],
    price: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    stock: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    coverArt: ['', Validators.maxLength(255)],
  });

  constructor() {
    this.albumService.findAll().subscribe({
      next: albums => {
        this.albums.set(albums);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.message.set({ text: 'No se pudo cargar el catálogo. Intenta más tarde', ok: false });
      },
    });
  }

  protected error(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) {
      return null;
    }
    const key = Object.keys(control.errors)[0];
    return MESSAGES[field][key] ?? 'Valor inválido';
  }

  protected edit(album: Album): void {
    this.editingId.set(album.idAlbum);
    this.message.set(null);
    this.form.reset({
      artist: album.artist,
      title: album.title,
      year: album.year,
      genre: album.genre,
      price: album.price,
      stock: album.stock,
      coverArt: album.coverArt ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request: AlbumRequest = {
      artist: value.artist!.trim(),
      title: value.title!.trim(),
      year: value.year,
      genre: value.genre!.trim(),
      price: value.price!,
      stock: value.stock!,
      coverArt: value.coverArt?.trim() || null,
    };
    const id = this.editingId();
    this.saving.set(true);
    this.message.set(null);
    (id === null ? this.albumService.create(request) : this.albumService.update(id, request)).subscribe({
      next: saved => {
        this.albums.update(albums => id === null
          ? [...albums, saved]
          : albums.map(album => album.idAlbum === id ? saved : album));
        this.saving.set(false);
        this.message.set({ text: id === null ? `Se creó "${saved.title}"` : `Se actualizó "${saved.title}"`, ok: true });
        this.cancel();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(this.describe(err));
      },
    });
  }

  protected remove(album: Album): void {
    if (!confirm(`¿Eliminar "${album.title}" de ${album.artist}? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.message.set(null);
    this.albumService.delete(album.idAlbum).subscribe({
      next: () => {
        this.albums.update(albums => albums.filter(item => item.idAlbum !== album.idAlbum));
        if (this.editingId() === album.idAlbum) {
          this.cancel();
        }
        this.message.set({ text: `Se eliminó "${album.title}"`, ok: true });
      },
      error: (err: HttpErrorResponse) => this.message.set(this.describe(err)),
    });
  }

  private describe(err: HttpErrorResponse): { text: string; ok: boolean; fields?: string[] } {
    switch (err.status) {
      case 400:
        return { text: 'Revisa los datos ingresados', ok: false, fields: Object.values(err.error?.fields ?? {}) };
      case 401:
        return { text: 'Tu sesión no es válida. Vuelve a iniciar sesión', ok: false };
      case 403:
        return { text: 'No tienes permisos para esta acción', ok: false };
      case 404:
        return { text: 'El álbum ya no existe', ok: false };
      default:
        return { text: 'No se pudo conectar con el servidor. Intenta más tarde', ok: false };
    }
  }
}
