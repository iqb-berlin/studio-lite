import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteDialogComponent } from './delete-dialog.component';

describe('DeleteDialogComponent', () => {
  let component: DeleteDialogComponent;
  let fixture: ComponentFixture<DeleteDialogComponent>;
  let mockDialogRef: Partial<MatDialogRef<DeleteDialogComponent>>;

  const mockDialogData = {
    title: 'Delete Item',
    content: 'Are you sure you want to delete this item?'
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        TranslateModule.forRoot(),
        DeleteDialogComponent
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with title and content from dialog data', () => {
    expect(component.title).toBe(mockDialogData.title);
    expect(component.content).toBe(mockDialogData.content);
  });

  it('should close dialog with true when confirm is called', () => {
    component.confirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when decline is called', () => {
    component.decline();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should render title and content in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(mockDialogData.title);
    expect(compiled.querySelector('p')?.textContent).toContain(mockDialogData.content);
  });
});
