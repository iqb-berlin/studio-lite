import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RolesMatrixComponent } from '../roles-matrix/roles-matrix.component';
import { RolesHeaderComponent } from './roles-header.component';

describe('RolesHeaderComponent', () => {
  let component: RolesHeaderComponent;
  let fixture: ComponentFixture<RolesHeaderComponent>;
  let mockMatDialog: { open: jest.Mock };

  beforeEach(async () => {
    mockMatDialog = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        RolesHeaderComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open roles matrix dialog', () => {
    component.showRolesMatrix();
    expect(mockMatDialog.open).toHaveBeenCalledWith(RolesMatrixComponent, { width: '800px' });
  });
});
