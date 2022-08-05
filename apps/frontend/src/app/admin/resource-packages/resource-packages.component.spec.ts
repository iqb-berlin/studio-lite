import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcePackagesComponent } from './resource-packages.component';

describe('ResourcePackageComponent', () => {
  let component: ResourcePackagesComponent;
  let fixture: ComponentFixture<ResourcePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourcePackagesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
