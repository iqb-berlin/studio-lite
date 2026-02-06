import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VocabNodeChangeService } from './vocab-node-change.service';
import { DialogData, Vocabulary, NotationNode } from '../models/vocabulary.class';

describe('VocabNodeChangeService', () => {
  let service: VocabNodeChangeService;
  let mockDialogData: DialogData;

  const mockNotationNode: NotationNode = {
    id: 'n1',
    prefLabel: { de: 'Node 1' },
    notation: ['1'],
    narrower: [
      {
        id: 'n1.1',
        prefLabel: { de: 'Node 1.1' },
        notation: ['1.1']
      }
    ]
  };

  const mockVocabulary: Vocabulary = {
    id: 'v1',
    type: 'test',
    title: { de: 'Vocab 1' },
    hasTopConcept: [mockNotationNode]
  };

  beforeEach(() => {
    mockDialogData = {
      value: [],
      props: {
        url: 'v1',
        allowMultipleValues: true,
        maxLevel: 0,
        hideNumbering: false,
        hideTitle: false,
        label: 'Label'
      },
      vocabularies: [
        { url: 'v1', data: mockVocabulary }
      ]
    };

    TestBed.configureTestingModule({
      providers: [
        VocabNodeChangeService,
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    });

    service = TestBed.inject(VocabNodeChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize data on creation', () => {
    const data = service.data;
    expect(data.length).toBe(1);
    expect(data[0].id).toBe('n1');
    expect(data[0].label).toBe('Node 1');
    expect(data[0].children.length).toBe(1);
    expect(data[0].children[0].id).toBe('n1.1');
  });

  it('should limit tree depth based on maxLevel', () => {
    mockDialogData.props.maxLevel = 1;
    // Re-initialize for new props
    const newService = new VocabNodeChangeService(mockDialogData);
    expect(newService.data[0].children.length).toBe(0);
  });

  describe('createTreeNodes', () => {
    it('should map node from dialogData.value if found', () => {
      mockDialogData.value = [
        {
          id: 'n1',
          name: '1 Label from Value',
          notation: ['1'],
          text: []
        }
      ];
      const node = service.createTreeNodes(1, mockNotationNode, 1);
      expect(node.label).toBe('Label from Value');
    });

    it('should use prefLabel if not found in value', () => {
      const node = service.createTreeNodes(1, mockNotationNode, 1);
      expect(node.label).toBe('Node 1');
    });
  });
});
