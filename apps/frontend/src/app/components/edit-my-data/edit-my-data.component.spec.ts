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

    it('should populate form fields with initial data', () => {
      expect(component.editUserForm.get('firstName')?.value).toBe('John');
      expect(component.editUserForm.get('lastName')?.value).toBe('Doe');
      expect(component.editUserForm.get('email')?.value).toBe('john.doe@example.com');
      expect(component.editUserForm.get('emailPublishApproval')?.value).toBe(true);
      expect(component.editUserForm.get('description')?.value).toBe('Test user description');
    });
  });
});
