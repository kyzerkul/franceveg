'use server'

import { revalidatePath } from 'next/cache'
import { updateClaim, updateRestaurant, updateReview, createBlogPost, updateBlogPost, deleteBlogPost, toggleBlogPostPublish } from './api'

export async function approveClaimAction(id: string) {
  await updateClaim(id, 'approved')
  revalidatePath('/claims')
}

export async function rejectClaimAction(id: string) {
  await updateClaim(id, 'rejected')
  revalidatePath('/claims')
}

export async function approveReviewAction(id: string) {
  await updateReview(id, 'approved')
  revalidatePath('/avis')
}

export async function rejectReviewAction(id: string) {
  await updateReview(id, 'rejected')
  revalidatePath('/avis')
}

export async function setRestaurantStatusAction(id: string, status: string) {
  await updateRestaurant(id, { status })
  revalidatePath('/restaurants')
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

type BlogFormData = {
  title: string; slug: string; content: string; excerpt: string
  cover_image: string; tags: string[]; seo_title: string
  seo_description: string; published: boolean
}

export async function createBlogPostAction(data: BlogFormData) {
  const post = await createBlogPost(data as Record<string, unknown>)
  revalidatePath('/blog')
  return { id: (post as { id: string }).id }
}

export async function updateBlogPostAction(id: string, data: Partial<BlogFormData>) {
  await updateBlogPost(id, data as Record<string, unknown>)
  revalidatePath('/blog')
  revalidatePath(`/blog/${id}/edit`)
}

export async function deleteBlogPostAction(id: string) {
  await deleteBlogPost(id)
  revalidatePath('/blog')
}

export async function togglePublishAction(id: string) {
  await toggleBlogPostPublish(id)
  revalidatePath('/blog')
}
