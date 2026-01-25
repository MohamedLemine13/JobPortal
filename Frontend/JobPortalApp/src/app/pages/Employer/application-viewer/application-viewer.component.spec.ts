import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationViewerComponent } from './application-viewer.component';

describe('ApplicationViewerComponent', () => {
  let component: ApplicationViewerComponent;
  let fixture: ComponentFixture<ApplicationViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
