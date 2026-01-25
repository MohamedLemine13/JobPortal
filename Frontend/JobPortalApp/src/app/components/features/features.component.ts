import { Component, ElementRef, AfterViewInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';
import {LucideAngularModule,Search,Users,FileText,MessageSquare,BarChart3,
  Shield,Clock,Award,Briefcase,Building2,LayoutDashboard,Plus
} from 'lucide-angular';


@Component({
  selector: 'app-features',
  imports: [LucideAngularModule],
  templateUrl: './features.component.html',
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
export class FeaturesComponent implements AfterViewInit {
  @ViewChild('featuresSection') featuresSection!: ElementRef;
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
      observer.observe(this.featuresSection.nativeElement);
    }
  }

  readonly jobSeekerFeatures=[
    {
      icon :Search,
      title:"smart Job Matching",
      description:"AI-powered algorithm matches you with relevent opprtunities based on your skills and preferences "
    },
     {
      icon :FileText,
      title:"Resume Builder",
      description:"create professional resume with our intuitive builder and templates designed by experts."
    },
     {
      icon :MessageSquare,
      title:"Direct Communication",
      description:"Connect directly with hiring managers and recruiters though our secure messaging platform"
    },
     {
      icon :Award,
      title:"Skill Assessment",
      description:"Showcase your abilities with verified skill test and earn badges that employers trust .",
    }

  ]

  readonly employerFeatures=[
    {
      icon:Users,
      title:"Talent pool Access",
      description:"Access our vast database of pre-screened candidates and find the perfect fit for your team "
    },
    {
      icon:BarChart3,
      title:"Analytics Dashboard",
      description:"Track your hiring performance with detailed analytics and insights on candidate engagement "
    },
    {
      icon:Shield,
      title:"Verified Candidates",
      description:"All candidates undergo background verification to ensure you're hiring trustworthy professionals"
    },
    {
      icon:Clock,
      title:"Quick Hiring ",
      description:"Streamlined hiring process reduces time-to-hire by 60% with automated screening tools "
    }
  ]

  //Navigation items configuration

  readonly NAVIGATION_MENU=[
    {id:"employer-dashboard",name:"Dashboard",icon:LayoutDashboard},
    {id:"post-job",name:"Post Job",icon:Plus},
    {id:"manage-jobs",name:"Manage Jobs",icon:Briefcase},
    {id:"company-profile",name:"Company Profile",icon:Building2}
  ]

  // Categories and job types
  readonly CATEGORIES = [
    { value: "Engineering", label: "Engineering" },
    { value: "Design", label: "Design" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "IT & Software", label: "IT & Software" },
    { value: "Customer-service", label: "Customer Service" },
    { value: "Product", label: "Product" },
    { value: "Operations", label: "Operations" },
    { value: "Finance", label: "Finance" },
    { value: "HR", label: "Human Resources" },
    { value: "Other", label: "Other" },
  ];

  readonly JOB_TYPES = [
    { value: "Remote", label: "Remote" },
    { value: "Full-Time", label: "Full-Time" },
    { value: "Part-Time", label: "Part-Time" },
    { value: "Contract", label: "Contract" },
    { value: "Internship", label: "Internship" },
  ];

  readonly SALARY_RANGES=[
    "Less than $1000",
    "$1000 - $15,000",
    "More than $15,000",
  ]




}
