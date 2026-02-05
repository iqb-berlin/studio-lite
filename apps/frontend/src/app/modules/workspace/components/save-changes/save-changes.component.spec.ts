import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { SaveChangesComponent } from './save-changes.component';

describe('ReviewSaveChangesComponent', () => {
  let component: SaveChangesComponent;
  let fixture: ComponentFixture<SaveChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule,
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit discardChanges', () => {
    const emitSpy = jest.spyOn(component.discardChanges, 'emit');

    component.discardChanges.emit(null);

    expect(emitSpy).toHaveBeenCalledWith(null);
  });

  it('should emit saveChanges', () => {
    const emitSpy = jest.spyOn(component.saveChanges, 'emit');

    component.saveChanges.emit(null);

    expect(emitSpy).toHaveBeenCalledWith(null);
  });
});
