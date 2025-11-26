import { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const user = authService.getCurrentUser();
    
    if (user && user.token) {
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${user.token}`)
        });
        return next(cloned);
    }
    return next(req);
};