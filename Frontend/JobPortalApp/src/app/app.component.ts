import { Component } from '@angular/core';
import { LucideAngularModule, FileIcon } from 'lucide-angular';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [  
    LucideAngularModule,RouterOutlet
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {}
