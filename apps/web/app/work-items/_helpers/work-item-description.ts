import type { Json } from '@repo/types';
import type { JSONContent } from '@tiptap/react';

type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
};

function isJsonObject(
  value: Json
): value is { [key: string]: Json | undefined } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function legacyParagraphToDoc(node: TiptapNode): JSONContent {
  const text = typeof node.text === 'string' ? node.text : '';

  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : [],
      },
    ],
  };
}

/** Supabase JSONB → TipTap editor document (DB/UI boundary). */
export function toTiptapContent(description: Json | null): JSONContent | null {
  if (description === null) {
    return null;
  }

  if (typeof description === 'string') {
    const trimmed = description.trim();
    if (!trimmed) {
      return null;
    }

    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: trimmed }],
        },
      ],
    };
  }

  if (!isJsonObject(description)) {
    return null;
  }

  if (description.type === 'doc' && Array.isArray(description.content)) {
    return description as unknown as JSONContent;
  }

  if (description.type === 'paragraph' && typeof description.text === 'string') {
    return legacyParagraphToDoc(description as TiptapNode);
  }

  return null;
}

/** TipTap editor document → Supabase JSONB (DB/UI boundary). */
export function fromTiptapContent(content: JSONContent): Json {
  return content as unknown as Json;
}

function nodeToPlainText(node: TiptapNode): string {
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }

  // Legacy flat paragraph shape from early seeds.
  if (node.type === 'paragraph' && typeof node.text === 'string') {
    return node.text;
  }

  if (!Array.isArray(node.content)) {
    return '';
  }

  const parts = node.content.map(nodeToPlainText).filter(Boolean);

  if (node.type === 'listItem') {
    return parts.join('');
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return parts.map((part) => `• ${part}`).join('\n');
  }

  if (node.type === 'heading' || node.type === 'paragraph') {
    return parts.join('');
  }

  if (node.type === 'doc') {
    return parts.join('\n\n');
  }

  return parts.join('');
}

export function extractWorkItemDescriptionText(
  description: Json | null
): string {
  if (!description) {
    return 'No description provided.';
  }

  if (typeof description === 'string') {
    return description;
  }

  if (typeof description !== 'object' || Array.isArray(description)) {
    return 'No description provided.';
  }

  const text = nodeToPlainText(description as TiptapNode);
  return text.trim() || 'No description provided.';
}

export function isTiptapDocument(
  description: Json | null
): description is Json & { type: 'doc' } {
  return (
    typeof description === 'object' &&
    description !== null &&
    !Array.isArray(description) &&
    'type' in description &&
    description.type === 'doc'
  );
}
