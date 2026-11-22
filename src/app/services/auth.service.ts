import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Profile } from '../models/profile';

interface Session {
  profile: Profile;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<Session | null>(null);

  readonly profile = computed(() => this.session()?.profile ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.profile()?.role === 'ADMIN');
  readonly authorization = computed(() => {
    const session = this.session();
    return session ? `Basic ${session.token}` : null;
  });

  login(username: string, password: string): Observable<Profile> {
    const token = this.encode(username, password);
    const headers = new HttpHeaders({ Authorization: `Basic ${token}` });
    return this.http
      .post<Profile>('/api/auth/login', null, { headers })
      .pipe(tap(profile => this.session.set({ profile, token })));
  }

  updateSession(profile: Profile, newPassword?: string): void {
    const current = this.session();
    if (!current) {
      return;
    }
    const token = newPassword ? this.encode(profile.username, newPassword) : current.token;
    this.session.set({ profile, token });
  }

  logout(): void {
    this.session.set(null);
  }

  private encode(username: string, password: string): string {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    return btoa(String.fromCharCode(...bytes));
  }
}
