import { MetadataRoute } from 'next'

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Monitor Dólar VE',
    short_name: 'Monitor Dólar',
    description: 'Tasas actualizadas al momento para Venezuela',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192 512x512',
        type: 'image/png',
      },
    ],
  }
}
