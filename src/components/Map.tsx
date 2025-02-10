"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"

interface MapPoint {
  id: number
  title: string
  lat: number
  lng: number
  postSlug: string
  postTitle: string
  postExcerpt: string
}

export interface MapProps {
  points: MapPoint[]
  center: [number, number]
  zoom: number
}

const Map: React.FC<MapProps> = ({ points, center, zoom }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Fix for Leaflet's default icon path issues with webpack
    if (typeof window !== "undefined") {
      const L = require("leaflet")
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      })
    }

    // This is needed to re-render the map when the component mounts on the client side
    window.dispatchEvent(new Event("resize"))
  }, [])

  if (!isMounted) {
    return <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "600px", width: "100%" }}
      className="rounded-lg shadow-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {points.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lng]}>
          <Popup>
            <div className="max-w-xs">
              <h3 className="font-semibold text-lg mb-2">{point.title}</h3>
              <h4 className="font-medium text-sm text-gray-700 mb-2">{point.postTitle}</h4>
              <p className="text-sm text-gray-600 mb-3">{point.postExcerpt}</p>
              <Link
                href={`/posts/${point.postSlug}`}
                className="inline-block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Read more →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default Map

