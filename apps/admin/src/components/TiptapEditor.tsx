'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Image as ImageIcon } from 'lucide-react'
import { useRef } from 'react'

type Props = {
  content: string
  onChange: (html: string) => void
}

export function TiptapEditor({ content, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false, allowBase64: false }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[320px] px-5 py-4 text-sm text-gray-700 leading-relaxed focus:outline-none',
      },
    },
  })

  if (!editor) return null

  async function handleImageUpload(file: File) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) return
    const { url } = await res.json() as { url: string }
    editor?.chain().focus().setImage({ src: url }).run()
  }

  const btn = (active: boolean) => ({
    className: 'p-1.5 rounded-lg transition-colors cursor-pointer',
    style: active
      ? { background: '#1B4332', color: 'white' }
      : { color: '#6B7280' },
  } as const)

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#E8EEEB' }}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b"
        style={{ borderColor: '#E8EEEB', background: '#F9FAFB' }}
      >
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} {...btn(editor.isActive('bold'))}>
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} {...btn(editor.isActive('italic'))}>
          <Italic size={14} />
        </button>
        <span className="w-px h-4 mx-1 bg-gray-200" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} {...btn(editor.isActive('heading', { level: 2 }))}>
          <Heading2 size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} {...btn(editor.isActive('heading', { level: 3 }))}>
          <Heading3 size={14} />
        </button>
        <span className="w-px h-4 mx-1 bg-gray-200" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} {...btn(editor.isActive('bulletList'))}>
          <List size={14} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} {...btn(editor.isActive('orderedList'))}>
          <ListOrdered size={14} />
        </button>
        <span className="w-px h-4 mx-1 bg-gray-200" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('URL du lien :')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          {...btn(editor.isActive('link'))}
        >
          <Link2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          {...btn(false)}
          title="Insérer une image"
        >
          <ImageIcon size={14} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
            e.target.value = ''
          }}
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
