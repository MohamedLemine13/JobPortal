import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<Toast[]>([]);

    show(message: string, type: ToastType = 'info', duration: number = 3000) {
        const id = Date.now().toString();
        const toast: Toast = { id, message, type, duration };

        this.toasts.update(current => [...current, toast]);

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
    }

    success(message: string, duration: number = 3000) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration: number = 3000) {
        this.show(message, 'error', duration);
    }

    info(message: string, duration: number = 3000) {
        this.show(message, 'info', duration);
    }

    warning(message: string, duration: number = 3000) {
        this.show(message, 'warning', duration);
    }

    remove(id: string) {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }
}
