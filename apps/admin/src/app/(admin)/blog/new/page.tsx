import { BlogPostForm } from '@/components/BlogPostForm'
import { createBlogPostAction } from '@/lib/actions'

export default function NewBlogPage() {
  return (
    <div>
      <h1
        className="text-2xl font-bold text-gray-900 mb-6"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Nouvel article
      </h1>
      <div
        className="rounded-2xl p-6"
        style={{ background: 'white', border: '1px solid #E8EEEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <BlogPostForm onSubmit={createBlogPostAction} />
      </div>
    </div>
  )
}
