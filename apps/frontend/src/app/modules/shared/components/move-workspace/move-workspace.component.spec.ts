import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoveWorkspaceComponent } from './move-workspace.component';
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {ReactiveFormsModule} from "@angular/forms";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {MatSelectModule} from "@angular/material/select";

describe('MoveWorkspaceComponent', () => {
  let component: MoveWorkspaceComponent;
  let fixture: ComponentFixture<MoveWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveWorkspaceComponent],
      imports: [
        TranslateModule.forRoot(),
        MatDialogModule,
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
