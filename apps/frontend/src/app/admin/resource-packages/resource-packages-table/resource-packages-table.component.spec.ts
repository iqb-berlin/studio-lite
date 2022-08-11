import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcePackagesTableComponent } from './resource-packages-table.component';

describe('ResourcePackagesTableComponent', () => {
  let component: ResourcePackagesTableComponent;
  let fixture: ComponentFixture<ResourcePackagesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourcePackagesTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcePackagesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
