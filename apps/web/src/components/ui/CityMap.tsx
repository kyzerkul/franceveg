'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { RestaurantCard } from '@/lib/api'

// City center fallbacks
const CITY_CENTERS: Record<string, [number, number]> = {
  paris: [48.8566, 2.3522],
  lyon: [45.7640, 4.8357],
  marseille: [43.2965, 5.3698],
  bordeaux: [44.8378, -0.5792],
  toulouse: [43.6047, 1.4442],
  nantes: [47.2184, -1.5536],
  lille: [50.6292, 3.0573],
  nice: [43.7102, 7.2620],
  strasbourg: [48.5734, 7.7521],
  montpellier: [43.6108, 3.8767],
  rennes: [48.1173, -1.6778],
  grenoble: [45.1885, 5.7245],
  rouen: [49.4432, 1.0993],
  dijon: [47.3220, 5.0415],
  angers: [47.4784, -0.5632],
  reims: [49.2583, 4.0317],
  metz: [49.1193, 6.1757],
  clermont: [45.7772, 3.0870],
}

function getCityCenter(slug: string, restaurants: RestaurantCard[]): [number, number] {
  const withCoords = restaurants.filter((r) => r.lat != null && r.lng != null)
  if (withCoords.length > 0) {
    const lat = withCoords.reduce((s, r) => s + r.lat!, 0) / withCoords.length
    const lng = withCoords.reduce((s, r) => s + r.lng!, 0) / withCoords.length
    return [lat, lng]
  }
  const key = Object.keys(CITY_CENTERS).find((k) => slug.startsWith(k))
  return key ? CITY_CENTERS[key] : [46.2276, 2.2137]
}

export function CityMap({
  restaurants,
  citySlug,
  cityName,
}: {
  restaurants: RestaurantCard[]
  citySlug: string
  cityName: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let L: any
    let map: LeafletMap

    async function init() {
      L = (await import('leaflet')).default

      if (!containerRef.current) return

      const center = getCityCenter(citySlug, restaurants)
      const withCoords = restaurants.filter((r) => r.lat != null && r.lng != null)
      const zoom = withCoords.length > 0 ? 13 : 11

      map = L.map(containerRef.current, { zoomControl: true }).setView(center, zoom)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const markerIcon = L.divIcon({
        html: `<div style="background:#2D6A4F;width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10],
      })

      for (const r of withCoords) {
        L.marker([r.lat!, r.lng!], { icon: markerIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui;min-width:140px">
              <strong style="font-size:13px;color:#1B4332">${r.name}</strong>
              <div style="font-size:11px;color:#6B7280;margin-top:2px">${r.tags.slice(0, 2).join(' · ')}</div>
              <a href="${r.region ? `/restaurants/${r.region.slug}/${r.slug}` : `/restaurants/${r.city.toLowerCase()}/${r.slug}`}"
                 style="display:inline-block;margin-top:6px;font-size:11px;color:#40916C;font-weight:600">
                Voir la fiche →
              </a>
            </div>`,
            { maxWidth: 200 },
          )
      }

      if (withCoords.length === 0) {
        L.popup({ closeButton: false })
          .setLatLng(center)
          .setContent(
            `<div style="font-size:12px;color:#6B7280;font-family:system-ui">Aucune adresse géolocalisée à ${cityName}</div>`,
          )
          .openOn(map)
      }
    }

    init()

    return () => {
      if (map) {
        map.remove()
        mapRef.current = null
      }
    }
  }, [citySlug, cityName]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '380px', borderRadius: 'inherit' }}
    />
  )
}
