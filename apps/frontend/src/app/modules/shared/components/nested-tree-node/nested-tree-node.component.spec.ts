import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NestedTreeNodeComponent } from './nested-tree-node.component';
import { WrappedIconComponent } from '../wrapped-icon/wrapped-icon.component';

describe('NestedTreeNodeComponent', () => {
  let component: NestedTreeNodeComponent;
  let fixture: ComponentFixture<NestedTreeNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NestedTreeNodeComponent, WrappedIconComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NestedTreeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
