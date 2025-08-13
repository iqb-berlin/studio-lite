Object.defineProperty(window, 'Intl', {
  writable: true,
  value: {
    DateTimeFormat: jest.fn().mockImplementation(() => ({
      resolvedOptions: jest.fn(() => ({
        timeZone: 'UTC',
        locale: 'en-US',
        calendar: 'gregory',
        numberingSystem: 'latn'
      })),
      format: jest.fn((date?: Date | number) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US');
      }),
      formatToParts: jest.fn((date?: Date | number) => {
        if (!date) return [];
        const d = new Date(date);
        return [
          { type: 'month', value: String(d.getMonth() + 1).padStart(2, '0') },
          { type: 'literal', value: '/' },
          { type: 'day', value: String(d.getDate()).padStart(2, '0') },
          { type: 'literal', value: '/' },
          { type: 'year', value: String(d.getFullYear()) }
        ];
      })
    })),
    NumberFormat: jest.fn().mockImplementation(() => ({
      format: jest.fn((num: number) => num.toString())
    })),
    RelativeTimeFormat: jest.fn().mockImplementation(() => ({
      format: jest.fn((value: number, unit: string) => `${value} ${unit}`)
    }))
  }
});

// Mock the locale registration
jest.mock('@angular/common', () => ({
  ...jest.requireActual('@angular/common'),
  registerLocaleData: jest.fn()
}));

// Mock the German locale data
jest.mock('@angular/common/locales/de', () => ({
  default: {}
}));

// Additional Angular Material mocks
Object.defineProperty(window, 'CSS', {
  value: {
    supports: jest.fn(() => false)
  }
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});
