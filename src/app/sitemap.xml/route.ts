import { NextResponse } from "next/server"

const POSTS_PER_PAGE = 100 // Increased for efficiency

async function fetchAllPosts(): Promise<any[]> {
  let allPosts: any[] = []
  let page = 1
  let hasMorePosts = true

  while (hasMorePosts) {
    const res = await fetch(`${process.env.WP_API_URL}/posts?page=${page}&per_page=${POSTS_PER_PAGE}`)
    if (!res.ok) break
    const posts = await res.json()
    allPosts = allPosts.concat(posts)
    hasMorePosts = posts.length === POSTS_PER_PAGE
    page++
  }

  return allPosts
}

export async function GET() {
  const posts = await fetchAllPosts()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}/posts</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      ${posts
        .map(
          (post) => `
        <url>
          <loc>${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}</loc>
          <lastmod>${post.modified}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `,
        )
        .join("")}
    </urlset>`

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}

