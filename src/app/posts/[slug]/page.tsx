import Link from "next/link"
import { JsonLd } from "react-schemaorg"
import type { BlogPosting } from "schema-dts"
import Image from "next/image"
import Seo from "@/components/Seo"

interface WordPressPost {
  slug: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  date: string
  modified: string
  _embedded?: {
    "wp:featuredmedia"?: {
      source_url: string
      alt_text: string
    }[]
    "wp:term"?: {
      id: number
      name: string
      slug: string
      taxonomy: "category" | "post_tag"
    }[][]
    author?: {
      name: string
    }[]
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

export default async function PostPage({ params }: { params: { slug: string } }) {
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

    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`
    const description = post.excerpt.rendered.replace(/<[^>]+>/g, "").slice(0, 160)

    return (
      <>
        <Seo
          title={post.title.rendered}
          description={description}
          canonicalUrl={canonicalUrl}
          ogImage={post._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
          ogType="article"
        />
        <JsonLd<BlogPosting>
          item={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title.rendered,
            description: description,
            datePublished: post.date,
            dateModified: post.modified,
            image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
            author: {
              "@type": "Person",
              name: post._embedded?.author?.[0]?.name || "Anonymous",
            },
            publisher: {
              "@type": "Organization",
              name: "Your Site Name",
              logo: {
                "@type": "ImageObject",
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
              },
            },
          }}
        />
        <main className="px-7 pt-24 pb-16 max-w-3xl mx-auto">
          <Link href="/posts" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to Posts
          </Link>
          <h1 className="text-4xl font-semibold mb-4">{post.title.rendered}</h1>
          <div className="mb-6 text-gray-600">
            Published on{" "}
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          {post._embedded?.["wp:featuredmedia"] &&
            !post.content.rendered.includes(post._embedded["wp:featuredmedia"][0].source_url) && (
              <Image
                src={post._embedded["wp:featuredmedia"][0].source_url || "/placeholder.svg"}
                alt={post._embedded["wp:featuredmedia"][0].alt_text || "Featured image"}
                width={800}
                height={600}
                className="w-full h-auto mb-6 rounded-lg shadow-md"
              />
            )}
          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />
          {post._embedded?.["wp:term"]
            ?.filter((terms) => terms[0]?.taxonomy === "category")
            ?.map((category) => (
              <div key={category[0].id} className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Category:</h2>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/category/${category[0].slug}`}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {category[0].name}
                  </Link>
                </div>
              </div>
            ))}
          {post._embedded?.["wp:term"]
            ?.filter((terms) => terms[0]?.taxonomy === "post_tag")
            ?.map((tags) => (
              <div key={tags[0].id} className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Tags:</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </main>
      </>
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

