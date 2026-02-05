import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { UnitGroupsComponent } from './unit-groups.component';

describe('UnitGroupsComponent', () => {
  let component: UnitGroupsComponent;
  let fixture: ComponentFixture<UnitGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnitGroupsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('expands all groups when expand button is clicked', () => {
    component.numberOfGroups = 2;
    component.expandedGroups = 0;
    component.groupsInfo = '2 groups | 4 units';
    fixture.detectChanges();

    jest.spyOn(component.expandAll, 'next');

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
    button?.click();

    expect(component.expandedGroups).toBe(2);
    expect(component.expandAll.next).toHaveBeenCalledWith(true);
  });

  it('collapses all groups when collapse button is clicked', () => {
    component.numberOfGroups = 2;
    component.expandedGroups = 2;
    component.groupsInfo = '2 groups | 4 units';
    fixture.detectChanges();

    jest.spyOn(component.expandAll, 'next');

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
    button?.click();

    expect(component.expandedGroups).toBe(0);
    expect(component.expandAll.next).toHaveBeenCalledWith(false);
  });
});
