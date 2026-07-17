import { cn } from '@repo/ui/lib/utils';

// Centralized generation function to manage high contrast options and scaling properties cleanly
const getEditorStyles = function (maximizedState: boolean): string {
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

    // THE FIXED LAYER CONFIGURATION FOR SIDEBAR VS FULL VIEW
    maximizedState
      ? 'prose-base text-base min-h-[calc(100vh-220px)] max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin'
      : 'prose-sm text-sm min-h-[160px] max-h-[320px] overflow-y-auto scrollbar-thin'
  );
};

export default getEditorStyles;
