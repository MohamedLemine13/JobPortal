import { Component, ElementRef, AfterViewInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { LucideAngularModule, Users, Briefcase, Target, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-analytics',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './analytics.component.html',
  animations: [
    trigger('fadeInUp', [
      state('hidden', style({ opacity: 0, transform: 'translateY(30px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [
        animate('0.6s ease-out')
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ])
  ]
})
export class AnalyticsComponent implements AfterViewInit {
  @ViewChild('analyticsSection') analyticsSection!: ElementRef;
  isVisible = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.isVisible = true;
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(this.analyticsSection.nativeElement);
    }
  }

  readonly stats = [
    {
      icon: Users,
      label: 'Active Users',
      value: '2.4M+',
      growth: '+15%',
      color: 'blue'
    },
    {
      icon: Briefcase,
      label: 'Jobs Posted',
      value: '150K+',
      growth: '+22%',
      color: 'purple'
    },
    {
      icon: Target,
      label: 'Successful Hires',
      value: '89K+',
      growth: '+18%',
      color: 'green'
    },
    {
      icon: TrendingUp,
      label: 'Match Rate',
      value: '94%',
      growth: '+8%',
      color: 'pink'
    }
  ];
}
