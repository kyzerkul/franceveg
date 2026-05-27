import { notFound } from 'next/navigation'
import { getAdminBlogPost } from '@/lib/api'
import { BlogPostForm } from '@/components/BlogPostForm'
import { updateBlogPostAction } from '@/lib/actions'

type Props = { params: Promise<{ id: string }> }

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params
  const post = await getAdminBlogPost(id).catch(() => null)
  if (!post) notFound()

  return (
    <div>
      <h1
        className="text-2xl font-bold text-gray-900 mb-6"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Éditer l&apos;article
      </h1>
      <div
        className="rounded-2xl p-6"
        style={{ background: 'white', border: '1px solid #E8EEEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <BlogPostForm
          initialData={{
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt ?? '',
            cover_image: post.cover_image ?? '',
            tags: post.tags,
            seo_title: post.seo_title ?? '',
            seo_description: post.seo_description ?? '',
            published: !!post.published_at,
          }}
          onSubmit={(data) => updateBlogPostAction(id, data)}
        />
      </div>
    </div>
  )
}
