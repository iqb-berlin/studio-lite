import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoveWorkspaceComponent } from './move-workspace.component';
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldControl, MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {MatSelect, MatSelectModule} from "@angular/material/select";

describe('MoveWorkspaceComponent', () => {
  let component: MoveWorkspaceComponent;
  let fixture: ComponentFixture<MoveWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveWorkspaceComponent],
      imports: [
        TranslateModule.forRoot(),
        MatDialogModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MoveWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
