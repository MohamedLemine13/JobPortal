import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  
  if (token && token !== 'undefined' && token !== 'null') {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('AuthInterceptor: Attached token to request', req.url);
    return next(cloned);
  } else {
    if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
        // Login/Register don't need token
    } else {
        console.warn('AuthInterceptor: No valid token found for request', req.url, 'Token value:', token);
    }
  }
  
  return next(req);
};
