import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import * as vocab from '../formly-chips/Bildungsstandards-Mathematik-Primar-2022-Inhaltsbezogene-Kompetenzen.json';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { NestedTreeComponent } from './nested-tree.component';

describe('NestedTreeComponent', () => {
  let component: NestedTreeComponent;
  let fixture: ComponentFixture<NestedTreeComponent>;

  @Component({ selector: 'studio-lite-nested-tree-node', template: '' })
  class MockNestedTreeNodeComponent {
    @Input() node = {
      url: '', name: '', description: '', notation: ''
    };

    @Input() values:Array<string> = [];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NestedTreeComponent,
        WrappedIconComponent,
        MockNestedTreeNodeComponent
      ],
      imports: [
        MatDialogModule,
        MatTreeModule,
        MatIconModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: MAT_DIALOG_DATA,
        useValue: vocab // Add any data you wish to test if it is passed/used correctly
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(NestedTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
