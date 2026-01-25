import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { AnalyticsComponent } from '../../components/analytics/analytics.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  imports: [NavbarComponent, FeaturesComponent, AnalyticsComponent, FooterComponent],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
   
}
