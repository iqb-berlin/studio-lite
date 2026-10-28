import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaTitleComponent } from './area-title.component';

describe('AreaTitleComponent', () => {
  let component: AreaTitleComponent;
  let fixture: ComponentFixture<AreaTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(AreaTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
