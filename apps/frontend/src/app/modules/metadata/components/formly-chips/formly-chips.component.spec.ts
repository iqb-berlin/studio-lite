import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { FormlyChipsComponent } from './formly-chips.component';
import { MetadataService } from '../../services/metadata.service';
import { NotationNode, VocabIdDictionaryValue } from '../../models/vocabulary.class';

describe('FormlyChipsComponent', () => {
  let component: FormlyChipsComponent;
  let fixture: ComponentFixture<FormlyChipsComponent>;
  let mockMetadataService: Partial<MetadataService>;
  let mockMatDialog: Partial<MatDialog>;

  beforeEach(async () => {
    mockMetadataService = {
      vocabularies: [],
      vocabulariesIdDictionary: {}
    };
    mockMatDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(null)
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        FormlyChipsComponent
      ],
      providers: [
        { provide: MetadataService, useValue: mockMetadataService },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyChipsComponent);
    component = fixture.componentInstance;

    // Set up formly field/formControl
    (component as unknown as { field: { formControl: FormControl; props: Record<string, unknown> } }).field = {
      formControl: new FormControl([]),
      props: {}
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true for empty when formControl value is empty', () => {
    component.formControl.setValue([]);
    expect(component.empty).toBe(true);
  });

  it('should return false for empty when formControl value is not empty', () => {
    component.formControl.setValue([{ id: '1', name: 'test' }]);
    expect(component.empty).toBe(false);
  });

  it('should remove an item from formControl value', () => {
    component.formControl.setValue([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
    component.remove(1);
    expect(component.formControl.value).toEqual([{ name: 'a' }, { name: 'c' }]);
    expect(component.formControl.touched).toBe(true);
  });

  it('should mark as touched and reset focus on blur', () => {
    component.field.focus = true;
    component.onBlur();
    expect(component.formControl.touched).toBe(true);
    expect(component.field.focus).toBe(false);
  });

  it('should open dialog on showNodeTree and update value on close', () => {
    const mockNodes: Partial<NotationNode>[] = [
      { id: 'id1', notation: ['N1'], label: 'Label 1' }
    ];
    mockMetadataService.vocabulariesIdDictionary = {
      id1: { labels: { de: 'Label 1 DE' }, notation: ['N1'] } as unknown as VocabIdDictionaryValue
    };

    const dialogRefSpy = {
      afterClosed: () => of({ nodes: mockNodes as NotationNode[], hideNumbering: false })
    };
    mockMatDialog.open = jest.fn().mockReturnValue(dialogRefSpy);

    component.showNodeTree();

    expect(mockMatDialog.open).toHaveBeenCalled();
    expect(component.formControl.value).toEqual([
      {
        id: 'id1',
        name: 'N1  Label 1 DE',
        notation: ['N1'],
        text: [{ lang: 'de', value: 'N1 Label 1' }]
      }
    ]);
  });

  it('should handle hideNumbering in showNodeTree results', () => {
    const mockNodes: Partial<NotationNode>[] = [
      { id: 'id1', notation: ['N1'], label: 'Label 1' }
    ];
    mockMetadataService.vocabulariesIdDictionary = {
      id1: { labels: { de: 'Label 1 DE' }, notation: ['N1'] } as unknown as VocabIdDictionaryValue
    };

    const dialogRefSpy = {
      afterClosed: () => of({ nodes: mockNodes as NotationNode[], hideNumbering: true })
    };
    mockMatDialog.open = jest.fn().mockReturnValue(dialogRefSpy);

    component.showNodeTree();

    expect(component.formControl.value).toEqual([
      {
        id: 'id1',
        name: 'Label 1 DE',
        notation: ['N1'],
        text: [{ lang: 'de', value: 'Label 1' }]
      }
    ]);
  });
});
