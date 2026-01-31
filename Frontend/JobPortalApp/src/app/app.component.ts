import { Component } from '@angular/core';
import { LucideAngularModule, FileIcon } from 'lucide-angular';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LucideAngularModule, RouterOutlet, ToastComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent { }
