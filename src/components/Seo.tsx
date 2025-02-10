import Head from "next/head"

interface SeoProps {
  title: string
  description: string
  canonicalUrl: string
  ogImage?: string
  ogType?: string
}

export default function Seo({ title, description, canonicalUrl, ogImage, ogType = "website" }: SeoProps) {
  const siteName = "Your Site Name"
  const fullTitle = `${title} | ${siteName}`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || "/default-og-image.jpg"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || "/default-og-image.jpg"} />
    </Head>
  )
}

