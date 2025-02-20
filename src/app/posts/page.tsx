import Link from "next/link"
import Image from "next/image"

interface WordPressPost {
  id: number
  slug: string
  title: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  date: string
  _embedded?: {
    "wp:featuredmedia"?: {
      source_url: string
      alt_text: string
    }[]
  }
}

interface PageProps {
  searchParams: { page?: string }
}

const POSTS_PER_PAGE = 10

async function getPosts(page: number): Promise<{ posts: WordPressPost[]; totalPages: number }> {
  const res = await fetch(`${process.env.WP_API_URL}/posts?page=${page}&per_page=${POSTS_PER_PAGE}&_embed`)
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  const posts = await res.json()
  const totalPages = Number.parseInt(res.headers.get("X-WP-TotalPages") || "0", 10)
  return { posts, totalPages }
}

export default async function PostsPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1

  try {
    const { posts, totalPages } = await getPosts(currentPage)

    return (
      <main className="px-7 pt-24 pb-16 max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold mb-8">All Posts</h1>
        {posts.length > 0 ? (
          <>
            <ul className="space-y-12">
              {posts.map((post, index) => (
                <li key={post.id} className="border-b pb-12">
                  <Link
                    href={`/posts/${post.slug}`}
                    className={`block group ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-6 md:flex`}
                  >
                    <div className="md:w-1/2 mb-4 md:mb-0">
                      {post._embedded?.["wp:featuredmedia"] ? (
                        <Image
                          src={post._embedded["wp:featuredmedia"][0].source_url || "/placeholder.svg"}
                          alt={post._embedded["wp:featuredmedia"][0].alt_text || post.title.rendered}
                          width={600}
                          height={400}
                          className="w-full h-64 object-cover rounded-lg transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center">
                      <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                        {post.title.rendered}
                      </h2>
                      <div className="text-gray-600 mb-2">
                        Published on{" "}
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div
                        className="text-gray-700 prose-sm"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/posts" />
          </>
        ) : (
          <p>No posts found.</p>
        )}
      </main>
    )
  } catch (error) {
    console.error("Error fetching posts:", error)
    return (
      <main className="px-7 pt-24 text-center">
        <h1 className="text-4xl font-semibold mb-7">Error</h1>
        <p className="text-red-500 mb-6">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
      </main>
    )
  }
}

function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: { currentPage: number; totalPages: number; baseUrl: string }) {
  return (
    <div className="flex justify-center space-x-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Previous
        </Link>
      )}
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  )
}

