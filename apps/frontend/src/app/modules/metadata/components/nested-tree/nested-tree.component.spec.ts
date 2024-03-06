import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { NestedTreeComponent } from './nested-tree.component';

describe('NestedTreeNodeComponent', () => {
  let component: NestedTreeComponent;
  let fixture: ComponentFixture<NestedTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NestedTreeComponent],
      imports: [
        MatCheckboxModule,
        MatDialogModule,
        MatTreeModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            value: null,
            props: {},
            vocabularies: []
          }
        }
      ]

    }).compileComponents();

    fixture = TestBed.createComponent(NestedTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
