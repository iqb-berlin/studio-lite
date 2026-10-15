import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { SchemerComponent } from '@iqb/ngx-coding-components';
import { CodingScheme } from '@iqbspecs/coding-scheme';
import { TranslateModule } from '@ngx-translate/core';

describe('Installed shared Schemer and Responses compatibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemerComponent, TranslateModule.forRoot()],
      providers: [{ provide: MatDialog, useValue: { open: jest.fn() } }]
    }).compileComponents();
  });

  const createSchemer = (type: string) => {
    const fixture = TestBed.createComponent(SchemerComponent);
    fixture.componentInstance.varList = JSON.stringify([{
      id: 'V', type, format: '', multiple: false, nullable: false, values: [], valuePositionLabels: []
    }]);
    fixture.componentInstance.codingScheme = new CodingScheme(JSON.stringify({
      version: '3.4', variableCodings: [{ id: 'V', sourceType: 'BASE_NO_VALUE', codes: [] }]
    }));
    return fixture;
  };

  it.each(['NO_VALUE', 'no-value'])('accepts %s in the actual installed Schemer without a factory mock', type => {
    const fixture = createSchemer(type);
    expect(fixture.componentInstance.problems).toEqual([]);
    expect(fixture.componentInstance.codingStatus.V).toBe('OK');
    fixture.destroy();
  });

  it('still reports a truly incompatible source through the installed Schemer', () => {
    const fixture = createSchemer('STRING');
    expect(fixture.componentInstance.problems).toContainEqual(expect.objectContaining({
      type: 'INVALID_SOURCE', breaking: true, variableId: 'V'
    }));
    expect(fixture.componentInstance.codingStatus.V).toBe('ERROR');
    fixture.destroy();
  });
});
