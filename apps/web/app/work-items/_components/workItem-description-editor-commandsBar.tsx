import EditorCommand from '@/app/work-items/_components/workItem-description-editor-command';
import { Button } from '@repo/ui/components/ui/button';
import {
  Bold,
  Code2,
  Italic,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Underline,
} from '@repo/ui/lib/icons';
import { Editor, useEditorState } from '@tiptap/react';
import { memo } from 'react';

const EditorCommandsBar = memo(function ({
  editor,
  isMaximized,
  onToggleMaximize,
}: Readonly<{
  readonly editor: Editor;
  isMaximized: boolean;
  readonly onToggleMaximize: () => void;
}>) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBoldActive: ctx.editor.isActive('bold'),
      isItalicActive: ctx.editor.isActive('italic'),
      isUnderlineActive: ctx.editor.isActive('underline'),
      isBulletListActive: ctx.editor.isActive('bulletList'),
      isOrderedListActive: ctx.editor.isActive('orderedList'),
      isCodeBlockActive: ctx.editor.isActive('codeBlock'),
    }),
  });

  return (
    <div className="border-border/80 flex items-center gap-1 border-b pb-1">
      <div className="flex items-center gap-1">
        <EditorCommand
          isActive={editorState.isBoldActive}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title={'Bold'}
          icon={<Bold className="h-4 w-4" />}
        />
        <EditorCommand
          isActive={editorState.isItalicActive}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title={'Italic'}
          icon={<Italic className="h-4 w-4" />}
        />
        <EditorCommand
          isActive={editorState.isUnderlineActive}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title={'Underline'}
          icon={<Underline className="h-4 w-4" />}
        />
        <EditorCommand
          isActive={editorState.isBulletListActive}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title={'List'}
          icon={<List className="h-4 w-4" />}
        />
        <EditorCommand
          isActive={editorState.isOrderedListActive}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title={'Ordered List'}
          icon={<ListOrdered className="h-4 w-4" />}
        />
        <EditorCommand
          isActive={editorState.isCodeBlockActive}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title={'Code Block'}
          icon={<Code2 className="h-4 w-4" />}
        />
      </div>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="ml-auto h-8 w-8 shrink-0 cursor-pointer"
        onClick={onToggleMaximize}
        title={isMaximized ? 'Minimize Editor' : 'Maximize Editor'}
      >
        {isMaximized ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
});

EditorCommandsBar.displayName = 'EditorCommandsBar';

export default EditorCommandsBar;
