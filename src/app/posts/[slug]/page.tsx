import Link from "next/link"

interface WordPressPost {
  slug: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  date: string
  _embedded?: {
    "wp:featuredmedia"?: {
      source_url: string
      alt_text: string
    }[]
    "wp:term"?: {
      id: number
      name: string
      taxonomy: "category" | "post_tag"
    }[][]
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
    const res = await fetch(`${process.env.WP_API_URL}/posts?slug=${params.slug}&_embed`)

    if (!res.ok) {
      throw new Error(`Failed to fetch post: ${res.status}`)
    }

    const posts = await res.json()

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Post not found")
    }

    const post: WordPressPost = posts[0]

    const publishDate = new Date(post.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const categories = post._embedded?.["wp:term"]?.find((terms) => terms[0]?.taxonomy === "category") || []
    const tags = post._embedded?.["wp:term"]?.find((terms) => terms[0]?.taxonomy === "post_tag") || []

    return (
      <main className="px-7 pt-24 pb-16 max-w-3xl mx-auto">
        <Link href="/posts" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Posts
        </Link>
        <h1 className="text-4xl font-semibold mb-4">{post.title.rendered}</h1>
        <div className="mb-6 text-gray-600">Published on {publishDate}</div>
        {post._embedded && post._embedded["wp:featuredmedia"] && (
          <img
            src={post._embedded["wp:featuredmedia"][0].source_url || "/placeholder.svg"}
            alt={post._embedded["wp:featuredmedia"][0].alt_text || "Featured image"}
            className="w-full h-auto mb-6 rounded-lg shadow-md"
          />
        )}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
        {categories.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Categories:</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        {tags.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Tags:</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    )
  } catch (error) {
    console.error("Error fetching post:", error)
    return (
      <main className="px-7 pt-24 text-center">
        <h1 className="text-4xl font-semibold mb-7">Post Not Found</h1>
        <p className="text-red-500 mb-6">{error instanceof Error ? error.message : "Failed to load post"}</p>
        <Link href="/posts" className="text-blue-600 hover:underline">
          Back to Posts
        </Link>
      </main>
    )
  }
}

