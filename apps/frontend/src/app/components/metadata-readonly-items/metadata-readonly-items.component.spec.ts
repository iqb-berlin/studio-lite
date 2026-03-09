/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { ItemsMetadataValues, MetadataValues } from '@studio-lite-lib/api-dto';
import { MetadataReadonlyItemsComponent } from './metadata-readonly-items.component';
import { MetadataProfileEntriesComponent } from '../metadata-profile-entries/metadata-profile-entries.component';
import { VariableIdPipe } from '../../pipes/variable-id.pipe';
import { AliasId } from '../../modules/metadata/models/alias-id.interface';

describe('MetadataReadonlyItemsComponent', () => {
  let component: MetadataReadonlyItemsComponent;
  let fixture: ComponentFixture<MetadataReadonlyItemsComponent>;

  @Component({
    selector: 'studio-lite-metadata-profile-entries',
    template: '',
    standalone: true
  })
  class MockMetadataProfileEntriesComponent {
    @Input() profiles!: MetadataValues[];
  }

  @Pipe({
    name: 'variableId',
    standalone: true
  })
  class MockVariableIdPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    transform(id: string, alias: string, variables: AliasId[]): string {
      return `mock-var-${id || alias}`;
    }
  }

  const mockItems: ItemsMetadataValues[] = [
    {
      id: 'item-1',
      variableId: 'var-1',
      variableReadOnlyId: 'ro-var-1',
      weighting: 1.5,
      description: 'Test Item 1',
      profiles: [{ profileId: 'p1', isCurrent: true, entries: [] }]
    },
    {
      id: '',
      variableId: 'var-2',
      weighting: 0,
      description: '',
      profiles: []
    }
  ];

  const mockVariables: AliasId[] = [
    { id: 'ro-var-1', alias: 'Alias 1' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MetadataReadonlyItemsComponent
      ]
    }).overrideComponent(MetadataReadonlyItemsComponent, {
      remove: { imports: [MetadataProfileEntriesComponent, VariableIdPipe] },
      add: { imports: [MockMetadataProfileEntriesComponent, MockVariableIdPipe] }
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataReadonlyItemsComponent);
    component = fixture.componentInstance;
    component.items = mockItems;
    component.variables = mockVariables;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all items', () => {
    const items = fixture.nativeElement.querySelectorAll('.item');
    expect(items.length).toBe(2);
  });

  it('should render item ID or fallback', () => {
    const itemIds = fixture.nativeElement.querySelectorAll('.item-id');
    expect(itemIds[0].textContent).toContain('item-1');
    // For second item, id is empty, should show translated fallback
    // Since TranslateModule.forRoot() is used without actual translations, it returns the key.
    expect(itemIds[1].textContent).toContain('metadata.without-id');
  });

  it('should render metadata fields correctly', () => {
    const item1 = fixture.nativeElement.querySelectorAll('.item')[0];
    const values = item1.querySelectorAll('.item-value');

    // Variable ID (via pipe)
    expect(values[0].textContent).toContain('mock-var-ro-var-1');
    // Weighting
    expect(values[1].textContent).toContain('1.5');
    // Description
    expect(values[2].textContent).toContain('Test Item 1');
  });

  it('should render fallbacks for empty metadata fields', () => {
    const item2 = fixture.nativeElement.querySelectorAll('.item')[1];
    const values = item2.querySelectorAll('.item-value');

    // Variable ID (via pipe)
    expect(values[0].textContent).toContain('mock-var-var-2');
    // Weighting (0 should be falsy and show '-')
    expect(values[1].textContent).toContain('-');
    // Description (empty should show '-')
    expect(values[2].textContent).toContain('-');
  });
});
