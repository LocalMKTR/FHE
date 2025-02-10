import Link from "next/link"
import Image from "next/image"
import { JsonLd } from "react-schemaorg"
import type { CollectionPage } from "schema-dts"
import Seo from "@/components/Seo"

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

interface WordPressCategory {
  id: number
  name: string
  slug: string
  description: string
}

interface PageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

const POSTS_PER_PAGE = 10

async function getCategory(slug: string): Promise<WordPressCategory> {
  const res = await fetch(`${process.env.WP_API_URL}/categories?slug=${slug}`)
  if (!res.ok) throw new Error(`Failed to fetch category: ${res.status}`)
  const categories = await res.json()
  if (!categories.length) throw new Error(`Category not found: ${slug}`)
  return categories[0]
}

async function getPostsByCategory(id: number, page: number): Promise<{ posts: WordPressPost[]; totalPages: number }> {
  const res = await fetch(
    `${process.env.WP_API_URL}/posts?categories=${id}&page=${page}&per_page=${POSTS_PER_PAGE}&_embed`,
  )
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`)
  const posts = await res.json()
  const totalPages = Number.parseInt(res.headers.get("X-WP-TotalPages") || "0", 10)
  return { posts, totalPages }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1

  try {
    const category = await getCategory(params.slug)
    const { posts, totalPages } = await getPostsByCategory(category.id, currentPage)

    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/category/${category.slug}`
    const description = category.description || `Posts in the "${category.name}" category`

    return (
      <>
        <Seo title={`${category.name} - Page ${currentPage}`} description={description} canonicalUrl={canonicalUrl} />
        <JsonLd<CollectionPage>
          item={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: category.name,
            description: description,
            url: canonicalUrl,
          }}
        />
        <main className="px-7 pt-24 pb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold mb-4">{category.name}</h1>
          {category.description && (
            <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: category.description }} />
          )}
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
              <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/category/${category.slug}`} />
            </>
          ) : (
            <p>No posts found in this category.</p>
          )}
          <Link href="/posts" className="mt-8 inline-block text-blue-600 hover:underline">
            ← Back to All Posts
          </Link>
        </main>
      </>
    )
  } catch (error) {
    console.error("Error fetching category or posts:", error)
    return (
      <main className="px-7 pt-24 text-center">
        <h1 className="text-4xl font-semibold mb-7">Error</h1>
        <p className="text-red-500 mb-6">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        <Link href="/posts" className="text-blue-600 hover:underline">
          Back to All Posts
        </Link>
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

