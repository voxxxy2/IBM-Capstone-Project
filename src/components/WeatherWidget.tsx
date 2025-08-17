
import { useEffect, useMemo, useState } from 'react'
import { geocodeName, reverseGeocode, fetchForecast, summarizeWeather, formatISOToID, type WeatherData } from '../lib/weather'

export default function WeatherWidget() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [data, setData] = useState<WeatherData | null>(null)
  const [label, setLabel] = useState<string>('')

  useEffect(() => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const locLabel = await reverseGeocode(latitude, longitude)
        const forecast = await fetchForecast(latitude, longitude)
        forecast.locationLabel = locLabel
        setData(forecast); setLabel(locLabel)
      } catch (e: any) {
        setErr(e?.message || 'Gagal memuat cuaca')
      } finally { setLoading(false) }
    }, () => setLoading(false), { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 })
  }, [])

  async function onSearch() {
    if (!query.trim()) return
    setLoading(true); setErr(null)
    try {
      const geo = await geocodeName(query.trim())
      if (!geo) { setErr('Lokasi tidak ditemukan.'); setLoading(false); return }
      const forecast = await fetchForecast(geo.latitude, geo.longitude)
      const loc = [geo.name, geo.admin1, geo.country].filter(Boolean).join(', ')
      forecast.locationLabel = loc
      setData(forecast); setLabel(loc)
    } catch (e: any) { setErr(e?.message || 'Gagal memuat cuaca') }
    finally { setLoading(false) }
  }

  const summary = useMemo(() => (data ? summarizeWeather(data) : ''), [data])

  return (
    <div className="card p-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Perkiraan Cuaca</div>
        <div className="sm:ml-auto flex gap-2">
          <input className="input" placeholder="Cari kota… (mis. Pontianak)" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSearch()} />
          <button className="btn-primary" onClick={onSearch} disabled={loading}>{loading ? 'Memuat…' : 'Cari'}</button>
        </div>
      </div>
      {err && <div className="text-xs text-red-600">{err}</div>}
      {!data && !loading && !err && <p className="text-sm text-gray-600 dark:text-zinc-300">Izinkan geolokasi atau cari kota untuk melihat ringkasan cuaca.</p>}
      {data && (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium text-gray-900 dark:text-zinc-100">{label || data.locationLabel || 'Lokasi'}</div>
            {typeof data.currentTemp === 'number' && <div className="text-sm text-gray-700 dark:text-zinc-300">• {Math.round(data.currentTemp)}°C sekarang</div>}
          </div>
          <div className="mt-1 text-sm text-gray-700 dark:text-zinc-200">{summary}</div>
          {data.daily?.length > 1 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {data.daily.slice(0, 3).map((d, i) => (
                <div key={i} className="rounded-lg border border-gray-200 dark:border-zinc-700 p-2 text-sm bg-white/60 dark:bg-zinc-800/60">
                  <div className="font-medium text-gray-900 dark:text-zinc-100">{i === 0 ? 'Hari ini' : formatISOToID(d.dateISO)}</div>
                  <div className="text-gray-700 dark:text-zinc-200">{Math.round(d.tMin)}° — {Math.round(d.tMax)}°C</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">Hujan: {d.precipSum.toFixed(1)} mm</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
