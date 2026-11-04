import { OrderedList } from '@tiptap/extension-ordered-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderedListExtension: {
      setOrderedListStyle: (newStyle: string) => ReturnType;
    };
  }
}

// Tiptap's ordered list holds its numbering as an HTML list type, which its paste conversion sets ('a', 'I', ...).
// A note has always written it as CSS (`list-style`), so the list keeps the type and writes it as CSS (#2100).
// A stored CSS value without a list type of its own, such as `lower-greek`, stays as it is.
const LIST_STYLE_OF_TYPE = new Map<string, string>([
  ['1', 'decimal'],
  ['a', 'lower-latin'],
  ['A', 'upper-latin'],
  ['i', 'lower-roman'],
  ['I', 'upper-roman']
]);

export const listStyleOf = (type: string | null | undefined): string => (
  type ? LIST_STYLE_OF_TYPE.get(type) ?? type : 'decimal'
);

// A browser splits the `list-style` shorthand into `listStyleType`, jsdom does not: then the style attribute tells.
const listStyleTypeOf = (element: HTMLElement): string => element.style.listStyleType ||
  (/list-style(?:-type)?\s*:\s*([a-z-]+)/i.exec(element.getAttribute('style') ?? '')?.[1] ?? '');

const listTypeOf = (listStyle: string): string | null => {
  const type = [...LIST_STYLE_OF_TYPE].find(([, style]) => style === listStyle)?.[0];
  if (type) return type === '1' ? null : type;
  return listStyle || null;
};

// Of a `type` attribute, as in HTML pasted from a comment, only a list type counts: the value ends up in the style.
const htmlListTypeOf = (element: HTMLElement): string | null => {
  const type = element.getAttribute('type');
  return type && LIST_STYLE_OF_TYPE.has(type) ? type : null;
};

export const OrderedListExtension = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: null,
        parseHTML: element => listTypeOf(listStyleTypeOf(element)) ?? htmlListTypeOf(element),
        // eslint-disable-next-line @typescript-eslint/dot-notation
        renderHTML: attributes => ({ style: `list-style: ${listStyleOf(attributes['type'])};` })
      }
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setOrderedListStyle: (newStyle: string) => ({ commands }) => commands
        .updateAttributes(this.name, { type: listTypeOf(newStyle) })
    };
  }
});
