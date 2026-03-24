import { BulletList } from '@tiptap/extension-bullet-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletListExtension: {
      setBulletListStyle: (newStyle: string) => ReturnType;
    };
  }
}

export const BulletListExtension = BulletList.extend({
  addAttributes() {
    return {
      listStyle: {
        default: 'disc',
        parseHTML: element => element.style.listStyleType,
        // eslint-disable-next-line @typescript-eslint/dot-notation
        renderHTML: attributes => ({ style: `list-style: ${attributes['listStyle']};` })
      }
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setBulletListStyle: (newStyle: string) => ({ commands }) => commands
        .updateAttributes(this.name, { listStyle: newStyle })
    };
  }
});
