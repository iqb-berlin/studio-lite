import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ResourcePackagesTableComponent } from './resource-packages-table.component';
import { environment } from '../../../../environments/environment';

describe('ResourcePackagesTableComponent', () => {
  let component: ResourcePackagesTableComponent;
  let fixture: ComponentFixture<ResourcePackagesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourcePackagesTableComponent],
      imports: [
        TranslateModule.forRoot(),
        MatTableModule,
        MatCheckboxModule,
        MatSortModule,
        NoopAnimationsModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcePackagesTableComponent);
    component = fixture.componentInstance;
    component.dataSource = new MatTableDataSource();
    component.selectedResourcePackages = new BehaviorSubject<number[]>([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
