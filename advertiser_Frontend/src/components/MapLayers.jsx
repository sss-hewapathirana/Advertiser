import { useState, useEffect, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

export function HeatmapLayer({ points, visible }) {
  const map = useMap()

  useEffect(() => {
    if (!points || points.length === 0 || !visible) return
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 12,
      max: 1.0,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' },
    })
    heat.addTo(map)
    return () => { map.removeLayer(heat) }
  }, [map, points, visible])

  return null
}

const poiIcons = {
  school: new L.DivIcon({ className: '', iconSize: [0, 0], html: '<div style="background:#6366f1;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>' }),
  hospital: new L.DivIcon({ className: '', iconSize: [0, 0], html: '<div style="background:#ef4444;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>' }),
  restaurant: new L.DivIcon({ className: '', iconSize: [0, 0], html: '<div style="background:#f59e0b;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>' }),
  transit: new L.DivIcon({ className: '', iconSize: [0, 0], html: '<div style="background:#10b981;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>' }),
  park: new L.DivIcon({ className: '', iconSize: [0, 0], html: '<div style="background:#8b5cf6;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>' }),
  default: new L.DivIcon({ className: '', iconSize: [0, 0], html: '<div style="background:#6b7280;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>' }),
}

const POI_CATEGORIES = ['school', 'hospital', 'restaurant', 'transit_station', 'park']

const amenityToIcon = (amenity) => {
  if (amenity === 'school' || amenity === 'university' || amenity === 'college') return poiIcons.school
  if (amenity === 'hospital' || amenity === 'clinic' || amenity === 'pharmacy') return poiIcons.hospital
  if (amenity === 'restaurant' || amenity === 'cafe' || amenity === 'fast_food') return poiIcons.restaurant
  if (amenity === 'bus_station' || amenity === 'train_station' || amenity === 'ferry_terminal' || amenity === 'taxi') return poiIcons.transit
  if (amenity === 'park' || amenity === 'playground' || amenity === 'garden') return poiIcons.park
  return poiIcons.default
}

export function POILayer({ visible, radius, center }) {
  const map = useMap()
  const [pois, setPois] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchPOI = useCallback(async (lat, lng, rad) => {
    setLoading(true)
    try {
      const overpassQuery = `[out:json];(node[amenity](around:${rad},${lat},${lng});way[amenity](around:${rad},${lat},${lng}););out center;`
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`, { signal: AbortSignal.timeout(10000) })
      const data = await res.json()
      const elements = data.elements || []
      const mapped = elements.slice(0, 100).map(el => ({
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        name: el.tags?.name || el.tags?.amenity || 'Unknown',
        amenity: el.tags?.amenity || 'unknown',
      })).filter(el => el.lat && el.lng)
      setPois(mapped)
    } catch {
      setPois([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!visible || !center) return
    const b = map.getBounds()
    const c = b.getCenter()
    fetchPOI(c.lat, c.lng, radius || 1000)
  }, [map, visible, radius, center?.lat, center?.lng, fetchPOI])

  useEffect(() => {
    if (!visible) {
      if (pois.length > 0) setPois([])
      return
    }
    const markers = pois.map(poi => {
      const marker = L.marker([poi.lat, poi.lng], { icon: amenityToIcon(poi.amenity) })
      marker.bindTooltip(poi.name, { direction: 'top', offset: [0, -8], className: 'poi-tooltip' })
      return marker
    })
    const group = L.layerGroup(markers)
    group.addTo(map)
    return () => { map.removeLayer(group) }
  }, [map, pois, visible])

  return null
}
