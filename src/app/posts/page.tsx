import Link from "next/link"

interface WordPressPost {
  id: number
  slug: string
  title: {
    rendered: string
  }
}

interface PageProps {
  searchParams: { page?: string }
}

const POSTS_PER_PAGE = 10

export default async function PostsPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1

  try {
    const res = await fetch(`${process.env.WP_API_URL}/posts?page=${currentPage}&per_page=${POSTS_PER_PAGE}`)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const posts: WordPressPost[] = await res.json()
    const totalPosts = Number.parseInt(res.headers.get("X-WP-Total") || "0", 10)
    const totalPages = Number.parseInt(res.headers.get("X-WP-TotalPages") || "0", 10)

    return (
      <main className="text-center pt-16 px-5">
        <h1 className="text-4xl md:text-5xl font-bold mb-7">All posts</h1>
        {posts.length > 0 ? (
          <>
            <ul className="space-y-2 mb-8">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/posts/${post.slug}`} className="text-blue-600 hover:underline">
                    {post.title.rendered}
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        ) : (
          <p>No posts found.</p>
        )}
      </main>
    )
  } catch (error) {
    console.error("Error fetching posts:", error)
    return (
      <main className="text-center pt-16 px-5">
        <h1 className="text-4xl md:text-5xl font-bold mb-7">All posts</h1>
        <p className="text-red-500">Error loading posts. Please try again later.</p>
      </main>
    )
  }
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  return (
    <div className="flex justify-center space-x-2">
      {currentPage > 1 && (
        <Link href={`/posts?page=${currentPage - 1}`} className="px-4 py-2 bg-blue-500 text-white rounded">
          Previous
        </Link>
      )}
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link href={`/posts?page=${currentPage + 1}`} className="px-4 py-2 bg-blue-500 text-white rounded">
          Next
        </Link>
      )}
    </div>
  )
}

