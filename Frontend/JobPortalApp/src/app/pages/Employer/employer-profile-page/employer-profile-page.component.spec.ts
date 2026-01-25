import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerProfilePageComponent } from './employer-profile-page.component';

describe('EmployerProfilePageComponent', () => {
  let component: EmployerProfilePageComponent;
  let fixture: ComponentFixture<EmployerProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerProfilePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
