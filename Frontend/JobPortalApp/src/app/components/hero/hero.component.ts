import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { LucideAngularModule, Search, Building2, TrendingUp, Users, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './hero.component.html',
  animations: [
    trigger('fadeInUp', [
      // This transition happens when the element enters the DOM (:enter)
      transition(':enter', [
        // Equivalent to initial={{ opacity: 0, y: 30 }}
        style({ opacity: 0, transform: 'translateY(30px)' }),
        // Equivalent to animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        // we use 'inherit' or a variable to handle the delay dynamically
        animate('0.6s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } }) // Default param
    ])
  ]
})
export class HeroComponent {
  readonly Search = Search;
  readonly MapPin = MapPin;
  isAuthenticated = true;
  user = { fullName: 'limam', role: 'employer' }

  stats = [
    { icons: Users, label: 'Active Users', value: '2.4M+' },
    { icons: Building2, label: 'Companies', value: '50K+' },
    { icons: TrendingUp, label: 'Jobs Posted', value: '150K+' }
  ]


}
