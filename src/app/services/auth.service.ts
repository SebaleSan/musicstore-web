import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Profile } from '../models/profile';

interface Session {
  profile: Profile;
  token: string;
}

const STORAGE_KEY = 'music-store-session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<Session | null>(this.restore());

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
      .pipe(tap(profile => this.save({ profile, token })));
  }

  updateSession(profile: Profile, newPassword?: string): void {
    const current = this.session();
    if (!current) {
      return;
    }
    const token = newPassword ? this.encode(profile.username, newPassword) : current.token;
    this.save({ profile, token });
  }

  logout(): void {
    this.save(null);
  }

  private save(session: Session | null): void {
    this.session.set(session);
    if (session) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  private restore(): Session | null {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private encode(username: string, password: string): string {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    return btoa(String.fromCharCode(...bytes));
  }
}
