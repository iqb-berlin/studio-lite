import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { EditMyDataComponent } from './edit-my-data.component';
import { MyData } from '../../models/my-data.interface';

describe('EditMyDataComponent', () => {
  const mockMyData: MyData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    emailPublishApproved: true,
    description: 'Test user description'
  };

  describe('with full data', () => {
    let component: EditMyDataComponent;
    let fixture: ComponentFixture<EditMyDataComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatCheckboxModule,
          TranslateModule.forRoot()
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockMyData
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(EditMyDataComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with injected data', () => {
      expect(component.editUserForm).toBeTruthy();
      expect(component.data).toEqual(mockMyData);
    });

    it('should populate form fields with initial data', () => {
      expect(component.editUserForm.get('firstName')?.value).toBe('John');
      expect(component.editUserForm.get('lastName')?.value).toBe('Doe');
      expect(component.editUserForm.get('email')?.value).toBe('john.doe@example.com');
      expect(component.editUserForm.get('emailPublishApproval')?.value).toBe(true);
      expect(component.editUserForm.get('description')?.value).toBe('Test user description');
    });

    it('should have all required form controls', () => {
      expect(component.editUserForm.get('firstName')).toBeTruthy();
      expect(component.editUserForm.get('lastName')).toBeTruthy();
      expect(component.editUserForm.get('email')).toBeTruthy();
      expect(component.editUserForm.get('emailPublishApproval')).toBeTruthy();
      expect(component.editUserForm.get('description')).toBeTruthy();
    });

    it('should accept form value updates', () => {
      component.editUserForm.patchValue({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        emailPublishApproval: false,
        description: 'Updated description'
      });

      expect(component.editUserForm.get('firstName')?.value).toBe('Jane');
      expect(component.editUserForm.get('lastName')?.value).toBe('Smith');
      expect(component.editUserForm.get('email')?.value).toBe('jane.smith@example.com');
      expect(component.editUserForm.get('emailPublishApproval')?.value).toBe(false);
      expect(component.editUserForm.get('description')?.value).toBe('Updated description');
    });
  });

  describe('with empty data', () => {
    let component: EditMyDataComponent;
    let fixture: ComponentFixture<EditMyDataComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatCheckboxModule,
          TranslateModule.forRoot()
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {}
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(EditMyDataComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should handle empty data object', () => {
      expect(component.editUserForm.get('firstName')?.value).toBeNull();
      expect(component.editUserForm.get('lastName')?.value).toBeNull();
      expect(component.editUserForm.get('email')?.value).toBeNull();
    });
  });

  describe('with partial data', () => {
    let component: EditMyDataComponent;
    let fixture: ComponentFixture<EditMyDataComponent>;

    const partialData: MyData = {
      firstName: 'Alice',
      email: 'alice@example.com'
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatCheckboxModule,
          TranslateModule.forRoot()
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: partialData
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(EditMyDataComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should handle partial data', () => {
      expect(component.editUserForm.get('firstName')?.value).toBe('Alice');
      expect(component.editUserForm.get('email')?.value).toBe('alice@example.com');
      expect(component.editUserForm.get('lastName')?.value).toBeNull();
    });
  });
});
