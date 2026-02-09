import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { NestedTreeComponent } from './nested-tree.component';
import { VocabNodeChangeService } from '../../services/vocab-node-change.service';
import { VocabNode, VocabFlatNode } from '../../models/vocabulary.class';

describe('NestedTreeNodeComponent', () => {
  let component: NestedTreeComponent;
  let fixture: ComponentFixture<NestedTreeComponent>;
  let mockVocabService: Partial<VocabNodeChangeService>;

  beforeEach(async () => {
    const mockData: VocabNode[] = [
      {
        id: '1',
        label: 'Node 1',
        children: []
      } as unknown as VocabNode,
      {
        id: '2',
        label: 'Node 2',
        children: [
          {
            id: '2.1',
            label: 'Node 2.1',
            children: []
          } as unknown as VocabNode
        ]
      } as unknown as VocabNode
    ];
    mockVocabService = {
      dataChange: new BehaviorSubject<VocabNode[]>(mockData)
    };

    await TestBed.configureTestingModule({
      imports: [
        MatCheckboxModule,
        MatDialogModule,
        MatTreeModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        NestedTreeComponent
      ],
      providers: [
        { provide: VocabNodeChangeService, useValue: mockVocabService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            value: null,
            props: { label: 'Test Vocab', allowMultipleValues: true },
            vocabularies: []
          }
        }
      ]
    }).overrideComponent(NestedTreeComponent, {
      set: {
        providers: [
          { provide: VocabNodeChangeService, useValue: mockVocabService }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(NestedTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dialog data', () => {
    expect(component.vocabularyTitle).toBe('Test Vocab');
  });

  it('should select nodes when vocabNodeSelectionToggle is called', () => {
    const node = component.treeControl.dataNodes[0];
    component.vocabNodeSelectionToggle(node);
    expect(component.checklistSelection.isSelected(node)).toBe(true);
  });

  it('should select descendants when parent is selected', () => {
    const parentNode = component.treeControl.dataNodes.find(n => n.id === '2') as VocabFlatNode;
    const childNode = component.treeControl.dataNodes.find(n => n.id === '2.1') as VocabFlatNode;

    component.vocabNodeSelectionToggle(parentNode);
    expect(component.checklistSelection.isSelected(parentNode)).toBe(true);
    expect(component.checklistSelection.isSelected(childNode)).toBe(true);
  });

  it('should handle single selection if allowMultipleValues is false', () => {
    component.dialogData.props.allowMultipleValues = false;
    const node1 = component.treeControl.dataNodes[0];
    const node2 = component.treeControl.dataNodes[1];

    component.vocabNodeSelectionToggle(node1);
    expect(component.checklistSelection.isSelected(node1)).toBe(true);

    component.vocabNodeSelectionToggle(node2);
    expect(component.checklistSelection.isSelected(node2)).toBe(true);
    expect(component.checklistSelection.isSelected(node1)).toBe(false);
  });
});
