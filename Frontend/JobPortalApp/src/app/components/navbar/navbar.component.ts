import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {LucideAngularModule,FileIcon,Briefcase} from 'lucide-angular';
import { HeroComponent } from '../hero/hero.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { FeaturesComponent } from "../features/features.component";

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule, RouterLink, HeroComponent],
  templateUrl: './navbar.component.html',
  animations: [
    trigger('fadeInDown', [
      transition(':enter', [
        // Start: Invisible and 30px above its final position
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        // End: Fully visible and at its natural position
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
})
export class NavbarComponent {
  readonly Briefcase = Briefcase;
   isAuthenticated=false;
   user={fullName:"Limam" ,role:"employee"}

}
