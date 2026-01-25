import { Component } from '@angular/core';
import { LucideAngularModule, Briefcase, Heart } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [LucideAngularModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly Briefcase = Briefcase;
  readonly Heart = Heart;
  currentYear = new Date().getFullYear();
}
