'use client';

import React, { memo, useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Minimize2,
  Maximize2,
  Underline,
  Check,
  Copy,
} from '@repo/ui/lib/icons';
import { cn } from '@repo/ui/lib/utils';
import {
  useEditor,
  EditorContent,
  JSONContent,
  useEditorState,
  Editor,
  NodeViewWrapper,
  NodeViewContent,
  NodeViewProps,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import { useEditorAutosave } from '@/hooks/use-editor-autosave';

type WorkItemDescriptionEditorProps = {
  id: string;
  initialContent: JSONContent | null;
  // eslint-disable-next-line no-unused-vars
  onSave: (content: JSONContent) => void;
  onCancel: () => void;
};

const lowlight = createLowlight(all);

const CodeBlockNodeView = ({ node }: NodeViewProps) => {
  const [copied, setCopied] = useState(false);
  const lang = node.attrs.language || 'plaintext';

  const handleCopy = async () => {
    const codeText = node.textContent;
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <NodeViewWrapper
      className={cn(
        'code-block-wrapper group relative my-4',
        'rounded-md bg-zinc-950 font-mono text-sm'
      )}
    >
      <div
        className={cn(
          'absolute top-2 right-3 z-10 flex items-center gap-2',
          'opacity-40 transition-opacity duration-150 select-none group-hover:opacity-100'
        )}
      >
        {lang !== 'plaintext' && lang !== 'auto' && (
          <span
            className={cn(
              'border-border/40 rounded border bg-zinc-900 px-1.5',
              'py-0.5 font-sans text-[10px] font-bold tracking-widest text-zinc-300 uppercase shadow-sm'
            )}
          >
            {lang}
          </span>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'border-border/40 flex h-6 w-6 cursor-pointer items-center justify-center rounded',
            'border bg-zinc-900 text-zinc-300 shadow-sm transition-colors hover:bg-zinc-800 hover:text-zinc-100'
          )}
          title="Copy Code"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </div>

      <pre className="m-0 overflow-x-auto bg-transparent p-0 pt-4">
        <NodeViewContent as="div" className="block bg-transparent p-0" />
      </pre>
    </NodeViewWrapper>
  );
};

const EditorCommandsBar = memo(
  ({
    editor,
    isMaximized,
    onToggleMaximize,
  }: Readonly<{
    editor: Editor;
    isMaximized: boolean;
    onToggleMaximize: () => void;
  }>) => {
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
          <Button
            type="button"
            size="icon"
            variant={editorState.isBoldActive ? 'secondary' : 'ghost'}
            className="h-8 w-8 shrink-0 cursor-pointer"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant={editorState.isItalicActive ? 'secondary' : 'ghost'}
            className="h-8 w-8 shrink-0 cursor-pointer"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant={editorState.isUnderlineActive ? 'secondary' : 'ghost'}
            className="h-8 w-8 shrink-0 cursor-pointer"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant={editorState.isBulletListActive ? 'secondary' : 'ghost'}
            className="h-8 w-8 shrink-0 cursor-pointer"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant={editorState.isOrderedListActive ? 'secondary' : 'ghost'}
            className="h-8 w-8 shrink-0 cursor-pointer"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant={editorState.isCodeBlockActive ? 'secondary' : 'ghost'}
            className="h-8 w-8 shrink-0 cursor-pointer"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
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
  }
);

EditorCommandsBar.displayName = 'EditorCommandsBar';

export default function WorkItemDescriptionEditor({
  id,
  initialContent,
  onSave,
  onCancel,
}: Readonly<WorkItemDescriptionEditorProps>) {
  const [isMaximized, setIsMaximized] = useState(false);

  const AUTOSAVE_STORAGE_KEY = `autosave_editor_${id}`;

  // Centralized generation function to manage high contrast options and scaling properties cleanly
  const getEditorStyles = (maximizedState: boolean) => {
    return cn(
      'max-w-none focus:outline-none outline-none p-4 transition-all duration-150',
      'text-foreground prose-strong:text-foreground prose-em:text-foreground prose-p:text-foreground prose-headings:text-foreground',
      'prose-ol:text-foreground prose-ul:text-foreground marker:text-foreground [&_ol]:list-decimal [&_ul]:list-disc',

      // Structural Code Blocks Configuration
      'prose-pre:!bg-zinc-950 prose-pre:border prose-pre:border-border/80 prose-pre:p-4 prose-pre:rounded-md',
      '[&_code]:font-mono [&_code]:!text-zinc-100 [&_code]:bg-zinc-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded',
      '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:!text-zinc-100',

      // High-Contrast Syntax Colors (Using ! to break through Tailwind Prose overrides)
      '[&_.hljs-comment]:!text-zinc-500 [&_.hljs-quote]:!text-zinc-500',
      '[&_.hljs-keyword]:!text-sky-400 [&_.hljs-selector-tag]:!text-sky-400 [&_.hljs-subst]:!text-sky-400',
      '[&_.hljs-string]:!text-lime-400 [&_.hljs-meta_.hljs-string]:!text-lime-400 [&_.hljs-regexp]:!text-lime-400',
      '[&_.hljs-number]:!text-amber-400 [&_.hljs-literal]:!text-amber-400 [&_.hljs-symbol]:!text-amber-400 [&_.hljs-bullet]:!text-amber-400',
      '[&_.hljs-title]:!text-pink-400 [&_.hljs-title.class_]:!text-pink-400 [&_.hljs-class_.hljs-title]:!text-pink-400',
      '[&_.hljs-name]:!text-rose-400 [&_.hljs-tag]:!text-zinc-300',
      '[&_.hljs-attr]:!text-orange-400 [&_.hljs-attribute]:!text-orange-400',
      '[&_.hljs-variable]:!text-zinc-100 [&_.hljs-template-variable]:!text-zinc-100',
      '[&_.hljs-built_in]:!text-cyan-400 [&_.hljs-type]:!text-cyan-400',
      '[&_.hljs-params]:!text-zinc-100 [&_.hljs-title.function_]:!text-pink-400',

      // Core structural pre block container styling
      'prose-pre:relative prose-pre:pt-10 prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-border/80 prose-pre:p-4 prose-pre:rounded-md',

      // Base layout & type config for custom label text
      'prose-pre:before:content-[attr(data-language)] prose-pre:before:absolute prose-pre:before:top-2.5 prose-pre:before:right-3',
      'prose-pre:before:text-[10px] prose-pre:before:font-mono prose-pre:before:font-bold prose-pre:before:uppercase prose-pre:before:tracking-widest',
      'prose-pre:before:text-zinc-300 prose-pre:before:bg-zinc-900 prose-pre:before:px-2 prose-pre:before:py-0.5 prose-pre:before:rounded prose-pre:before:border prose-pre:before:border-border/60 prose-pre:before:shadow-sm',

      // Intercept the tag values and render the pre block
      '[&_pre[data-language="auto"]]:before:!hidden [&_pre[data-language="plaintext"]]:before:!hidden [&_pre:not([data-language])]:before:!hidden',

      // ANY unhandled lowlight code tokens to be crisp white text
      '[&_pre_*]:!text-zinc-100',

      maximizedState
        ? 'prose-base text-base min-h-[calc(100vh-220px)]'
        : 'prose-sm text-sm min-h-[160px]'
    );
  };

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockNodeView);
        },
      }),
    ],
    content: initialContent ?? '',
    editable: true,
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: getEditorStyles(false),
      },
    },
  });

  const { clearAutosave } = useEditorAutosave({
    editor,
    storageKey: AUTOSAVE_STORAGE_KEY,
  });

  // Watch component execution parameters to keep class targets updated on transitions
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          class: getEditorStyles(isMaximized),
        },
      },
    });
  }, [isMaximized, editor]);

  // Freeze background body scrolling when the workspace editor component is maximized
  useEffect(() => {
    if (isMaximized) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isMaximized]);

  const handleSave = () => {
    onSave(editor.getJSON());
    clearAutosave();
  };

  if (!editor) return null;

  return (
    <div
      className={cn(
        'bg-background flex flex-col border transition-all duration-200',
        isMaximized
          ? 'fixed inset-0 z-50 h-screen w-screen gap-4 rounded-none p-6'
          : 'relative w-full gap-2 rounded-lg p-2'
      )}
    >
      <EditorCommandsBar
        editor={editor}
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
      />

      <div
        className={cn(
          'bg-background/50 overflow-y-auto rounded-md border',
          isMaximized ? 'flex-1' : ''
        )}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="border-border/40 mt-auto flex items-center justify-end gap-2 border-t pt-1">
        <Button
          className="cursor-pointer"
          size={isMaximized ? 'default' : 'sm'}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          className="cursor-pointer"
          size={isMaximized ? 'default' : 'sm'}
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
