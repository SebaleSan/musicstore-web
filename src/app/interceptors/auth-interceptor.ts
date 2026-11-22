import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  let headers = req.headers.set('X-Requested-With', 'XMLHttpRequest');
  const authorization = inject(AuthService).authorization();
  if (authorization && !headers.has('Authorization')) {
    headers = headers.set('Authorization', authorization);
  }
  return next(req.clone({ headers }));
};
