import dynamic from "next/dynamic"
import Link from "next/link"
import type { MapProps } from "@/components/Map"

const DynamicMap = dynamic<MapProps>(() => import("@/components/Map"), {
  loading: () => <p>Loading map...</p>,
  ssr: false,
})

const mapPoints = [
  {
    id: 1,
    title: "Tampico, Mexico",
    lat: 22.2549,
    lng: -97.8664,
    postSlug: "tampico-port-history",
    postTitle: "The Historic Port of Tampico",
    postExcerpt:
      "Discover the rich history of Tampico's port, one of Mexico's most important maritime gateways since the 19th century...",
  },
  {
    id: 2,
    title: "Veracruz, Mexico",
    lat: 19.1738,
    lng: -96.1342,
    postSlug: "veracruz-maritime-trade",
    postTitle: "Veracruz: Gateway to the Gulf",
    postExcerpt:
      "Explore how Veracruz became Mexico's primary port for international trade and its significance in modern commerce...",
  },
  {
    id: 3,
    title: "Coatzacoalcos, Mexico",
    lat: 18.1345,
    lng: -94.459,
    postSlug: "coatzacoalcos-industrial-port",
    postTitle: "Coatzacoalcos: Industrial Hub",
    postExcerpt:
      "Learn about the industrial development of Coatzacoalcos and its role in Mexico's petrochemical industry...",
  },
  {
    id: 4,
    title: "Ciudad del Carmen, Mexico",
    lat: 18.6445,
    lng: -91.829,
    postSlug: "ciudad-del-carmen-oil",
    postTitle: "Ciudad del Carmen: Oil City",
    postExcerpt: "Discover how Ciudad del Carmen transformed from a fishing village to a major oil industry center...",
  },
  {
    id: 5,
    title: "Progreso, Mexico",
    lat: 21.2822,
    lng: -89.6627,
    postSlug: "progreso-yucatan-port",
    postTitle: "Progreso: Yucatán's Maritime Gateway",
    postExcerpt:
      "Experience the development of Progreso as the Yucatán Peninsula's main port and tourist destination...",
  },
  // Add similar post data for other locations...
]

export default function MapPage() {
  return (
    <main className="px-7 pt-24 pb-16 max-w-4xl mx-auto">
      <h1 className="text-4xl font-semibold mb-8">Caribbean Ports Map</h1>
      <DynamicMap points={mapPoints} center={[22.031755070238948, -97.27557099167655]} zoom={5} />
      <Link href="/posts" className="mt-8 inline-block text-blue-600 hover:underline">
        ← Back to Posts
      </Link>
    </main>
  )
}

