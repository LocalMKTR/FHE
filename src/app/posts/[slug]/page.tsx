import Link from "next/link"

interface WordPressPost {
  slug: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
}

const POSTS_PER_PAGE = 10

export async function generateStaticParams() {
  try {
    const allSlugs: { slug: string }[] = []
    let page = 1
    let hasMorePosts = true

    while (hasMorePosts) {
      const res = await fetch(`${process.env.WP_API_URL}/posts?page=${page}&per_page=${POSTS_PER_PAGE}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const posts: WordPressPost[] = await res.json()
      allSlugs.push(...posts.map((post) => ({ slug: post.slug })))

      const totalPages = Number.parseInt(res.headers.get("X-WP-TotalPages") || "0", 10)
      hasMorePosts = page < totalPages
      page++
    }

    console.log(`Generated params for ${allSlugs.length} posts`)
    return allSlugs
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  try {
    const res = await fetch(`${process.env.WP_API_URL}/posts?slug=${params.slug}`)

    if (!res.ok) {
      throw new Error(`Failed to fetch post: ${res.status}`)
    }

    const posts = await res.json()

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Post not found")
    }

    const post = posts[0]

    return (
      <main className="px-7 pt-24 text-center">
        <h1 className="text-5xl font-semibold mb-7">{post.title.rendered}</h1>
        <div
          className="max-w-[700px] mx-auto prose prose-lg dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </main>
    )
  } catch (error) {
    console.error("Error fetching post:", error)
    return (
      <main className="px-7 pt-24 text-center">
        <h1 className="text-5xl font-semibold mb-7">Post Not Found</h1>
        <p className="text-red-500">{error instanceof Error ? error.message : "Failed to load post"}</p>
        <Link href="/posts" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Posts
        </Link>
      </main>
    )
  }
}

