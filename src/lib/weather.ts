
export type GeoResult = { name: string; latitude: number; longitude: number; country?: string; admin1?: string }
export type DailyForecast = { dateISO: string; tMax: number; tMin: number; precipSum: number }
export type WeatherData = { locationLabel: string; currentTemp?: number; daily: DailyForecast[]; hourlyPrecipProbMaxNext12h?: number }

export async function geocodeName(name: string): Promise<GeoResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=id&format=json`
  const res = await fetch(url); if (!res.ok) return null
  const json = await res.json(); const r = json?.results?.[0]; if (!r) return null
  return { name: r.name, latitude: r.latitude, longitude: r.longitude, country: r.country, admin1: r.admin1 }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=id&format=json`
  try {
    const res = await fetch(url); if (!res.ok) return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    const json = await res.json(); const r = json?.results?.[0]
    if (!r) return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    return [r.name, r.admin1, r.country].filter(Boolean).join(', ')
  } catch { return `${lat.toFixed(2)}, ${lon.toFixed(2)}` }
}

export async function fetchForecast(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat), longitude: String(lon), current_weather: 'true', timezone: 'auto',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum', hourly: 'precipitation_probability'
  })
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  const res = await fetch(url); if (!res.ok) throw new Error('Gagal memuat cuaca')
  const json = await res.json()
  const currentTemp = json?.current_weather?.temperature
  const daily: DailyForecast[] = (json?.daily?.time || []).map((iso: string, i: number) => ({
    dateISO: iso, tMax: json.daily.temperature_2m_max?.[i] ?? NaN, tMin: json.daily.temperature_2m_min?.[i] ?? NaN, precipSum: json.daily.precipitation_sum?.[i] ?? 0,
  }))

  let hourlyMax12: number | undefined
  try {
    const times: string[] = json?.hourly?.time ?? []
    const probs: number[] = json?.hourly?.precipitation_probability ?? []
    const now = new Date()
    const startIdx = times.findIndex((t) => new Date(t).getHours() === now.getHours() && new Date(t).getDate() === now.getDate())
    const window = probs.slice(Math.max(0, startIdx), Math.max(0, startIdx) + 12)
    hourlyMax12 = window.length ? Math.max(...window) : undefined
  } catch { hourlyMax12 = undefined }

  return { locationLabel: '', currentTemp, daily, hourlyPrecipProbMaxNext12h: hourlyMax12 }
}

export function summarizeWeather(data: WeatherData): string {
  if (!data.daily?.length) return 'Cuaca tidak tersedia saat ini.'
  const today = data.daily[0]; const t = (n: number) => `${Math.round(n)}°C`
  let line = `Hari ini: ${t(today.tMin)}–${t(today.tMax)}`
  if (typeof data.currentTemp === 'number') line = `Saat ini ${t(data.currentTemp)} · ` + line
  const rain12 = data.hourlyPrecipProbMaxNext12h ?? 0; const rainSum = today.precipSum || 0
  let advice = ''
  if (rain12 >= 70 || rainSum >= 5) advice = 'Kemungkinan hujan tinggi — siapkan payung ☔.'
  else if (rain12 >= 40 || rainSum >= 1) advice = 'Ada peluang hujan ringan — pertimbangkan jas hujan.'
  else advice = 'Kecil kemungkinan hujan.'
  return `${line}. ${advice}`
}

export function formatISOToID(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long' }).format(d)
  } catch { return iso }
}
