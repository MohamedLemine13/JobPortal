import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../../services/toast.service';
import { LucideAngularModule, CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-angular';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none md:top-20">
      <div
        *ngFor="let toast of toastService.toasts()"
        [@toastAnimation]
        class="pointer-events-auto flex items-center p-4 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px] max-w-md w-full transition-all duration-300 transform"
        [ngClass]="getToastClasses(toast.type)"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mr-3">
          <lucide-angular
            [img]="getIcon(toast.type)"
            [class]="getIconColor(toast.type)"
          ></lucide-angular>
        </div>

        <!-- Message -->
        <div class="flex-1 text-sm font-medium">
          {{ toast.message }}
        </div>

        <!-- Close Button -->
        <button
          (click)="removeToast(toast.id)"
          class="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <lucide-angular [img]="X" class="w-4 h-4"></lucide-angular>
        </button>
      </div>
    </div>
  `,
    animations: [
        trigger('toastAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('0.3s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('0.2s ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class ToastComponent {
    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;
    readonly Info = Info;
    readonly AlertTriangle = AlertTriangle;
    readonly X = X;

    constructor(public toastService: ToastService) { }

    removeToast(id: string) {
        this.toastService.remove(id);
    }

    getToastClasses(type: ToastType): string {
        const classes = {
            'success': 'bg-white/90 border-green-200 text-gray-800 dark:bg-gray-800/90 dark:border-green-900 dark:text-gray-100',
            'error': 'bg-white/90 border-red-200 text-gray-800 dark:bg-gray-800/90 dark:border-red-900 dark:text-gray-100',
            'info': 'bg-white/90 border-blue-200 text-gray-800 dark:bg-gray-800/90 dark:border-blue-900 dark:text-gray-100',
            'warning': 'bg-white/90 border-yellow-200 text-gray-800 dark:bg-gray-800/90 dark:border-yellow-900 dark:text-gray-100'
        };
        return classes[type];
    }

    getIcon(type: ToastType): any {
        const icons = {
            'success': this.CheckCircle,
            'error': this.XCircle,
            'info': this.Info,
            'warning': this.AlertTriangle
        };
        return icons[type];
    }

    getIconColor(type: ToastType): string {
        const colors = {
            'success': 'text-green-500',
            'error': 'text-red-500',
            'info': 'text-blue-500',
            'warning': 'text-yellow-500'
        };
        return colors[type];
    }
}
