"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"

export function MapContainer({ className }) {
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [24.7136, 46.6753],
        zoom: 11,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className={className}>
      <div id="map" className="h-[calc(100vh-120px)] rounded-lg" />
    </div>
  )
} 