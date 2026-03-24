import { OrderedList } from '@tiptap/extension-ordered-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderedListExtension: {
      setOrderedListStyle: (newStyle: string) => ReturnType;
    };
  }
}

export const OrderedListExtension = OrderedList.extend({
  addAttributes() {
    return {
      listStyle: {
        default: 'decimal',
        parseHTML: element => element.style.listStyleType,
        // eslint-disable-next-line @typescript-eslint/dot-notation
        renderHTML: attributes => ({ style: `list-style: ${attributes['listStyle']};` })
      }
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setOrderedListStyle: (newStyle: string) => ({ commands }) => commands
        .updateAttributes(this.name, { listStyle: newStyle })
    };
  }
});
