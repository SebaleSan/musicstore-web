import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Album, AlbumRequest } from '../models/album';

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/albums';

  findAll(): Observable<Album[]> {
    return this.http.get<Album[]>(this.url);
  }

  findById(id: number): Observable<Album> {
    return this.http.get<Album>(`${this.url}/${id}`);
  }

  create(request: AlbumRequest): Observable<Album> {
    return this.http.post<Album>(this.url, request);
  }

  update(id: number, request: AlbumRequest): Observable<Album> {
    return this.http.put<Album>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
