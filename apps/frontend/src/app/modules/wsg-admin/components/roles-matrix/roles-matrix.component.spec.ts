import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RolesMatrixComponent } from './roles-matrix.component';

describe('RolesMatrixComponent', () => {
  let component: RolesMatrixComponent;
  let fixture: ComponentFixture<RolesMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RolesMatrixComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
