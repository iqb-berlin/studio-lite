// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ShowResponsesComponent } from './show-responses.component';

describe('ShowResponsesComponent', () => {
  let component: ShowResponsesComponent;
  let fixture: ComponentFixture<ShowResponsesComponent>;

  const setup = async (data: { responses: unknown[]; table: boolean }) => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', async () => {
    await setup({ responses: [], table: false });

    expect(component).toBeTruthy();
  });

  it('should initialize table when data.table is true', async () => {
    const responses = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }];
    await setup({ responses, table: true });

    expect(component.displayedColumns).toEqual(['key', 'value']);
    expect(component.dataSource).toEqual(responses);
  });

  it('should not initialize table when data.table is false', async () => {
    await setup({ responses: [{ key: 'a' }], table: false });

    expect(component.displayedColumns).toEqual([]);
    expect(component.dataSource).toEqual([]);
  });
});
