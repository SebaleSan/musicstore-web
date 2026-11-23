import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Profile, ProfileUpdateRequest, RegisterRequest } from '../models/profile';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  register(request: RegisterRequest): Observable<Profile> {
    return this.http.post<Profile>('/api/auth/register', request);
  }

  updateProfile(request: ProfileUpdateRequest): Observable<Profile> {
    return this.http
      .put<Profile>('/api/auth/profile', request)
      .pipe(tap(profile => this.auth.updateSession(profile, request.password)));
  }
}
