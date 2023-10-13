// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { UnitMetadataComponent } from './unit-metadata.component';

describe('StartReviewButtonComponent', () => {
  let component: UnitMetadataComponent;
  let fixture: ComponentFixture<UnitMetadataComponent>;

  @Component({ selector: 'studio-lite-metadata', template: '' })
  class MockMetadataComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitMetadataComponent,
        MockMetadataComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
