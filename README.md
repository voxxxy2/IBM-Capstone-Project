
# Granite Notes

Granite Notes adalah aplikasi catatan modern untuk IBM Capstone Project. Seluruh pengembangan dibimbing oleh **IBM Granite 3.3 8B**.

## Fitur
- CRUD catatan (Markdown preview)
- Pencarian & tag, ⭐ favorite, 📌 pinned
- Grid/List toggle
- Trash (restore/empty)
- Ekspor JSON/CSV & Impor JSON
- Dark mode, animasi greeting + confetti
- Widget cuaca (Open-Meteo)
- Reminder (Notification API)
- PWA: installable + offline (service worker, manifest)

## Teknologi
React + Vite + TypeScript, Zustand, TailwindCSS

## Jalankan
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy
- Netlify: build `npm run build`, publish `dist`
- Vercel: build `npm run build`, output `dist`
