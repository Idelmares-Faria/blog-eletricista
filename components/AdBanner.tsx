'use client'

import { useEffect, useState } from 'react'

interface Ad {
  id: number
  name: string
  location: string
  image_url: string | null
  link_url: string | null
  alt_text: string | null
  html_code: string | null
}

interface AdBannerProps {
  location: string
  width?: number
  height?: number
  className?: string
}

export default function AdBanner({ location, width, height, className = '' }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/ads?location=${encodeURIComponent(location)}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data.length > 0) {
          setAd(res.data[0])
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [location])

  function handleClick() {
    if (ad) {
      fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id }),
      })
    }
  }

  // Show placeholder if no ad
  if (!ad) {
    if (!loaded) return null
    return (
      <div
        className={`bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-muted)] text-[11px] uppercase font-bold ${className}`}
        style={{ height: height || 100 }}
      >
        Espaço Publicitário
      </div>
    )
  }

  // HTML code ad (e.g., Google AdSense)
  if (ad.html_code) {
    return (
      <div
        className={`ad-banner rounded-xl overflow-hidden ${className}`}
        style={{ minHeight: height || 100 }}
        dangerouslySetInnerHTML={{ __html: ad.html_code }}
      />
    )
  }

  // Image ad
  if (ad.image_url) {
    const img = (
      <img
        src={ad.image_url}
        alt={ad.alt_text || ad.name}
        className="w-full h-full object-cover rounded-xl"
        style={{ maxHeight: height || 100 }}
        loading="lazy"
      />
    )

    if (ad.link_url) {
      return (
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className={`block rounded-xl overflow-hidden transition-opacity hover:opacity-90 ${className}`}
          style={{ height: height || 100 }}
        >
          {img}
        </a>
      )
    }

    return (
      <div className={`rounded-xl overflow-hidden ${className}`} style={{ height: height || 100 }}>
        {img}
      </div>
    )
  }

  return null
}

// Helper: insert ad banners between items in a list (every N items)
export function insertAdsBetweenPosts(
  posts: React.ReactNode[],
  location: string,
  every: number = 6,
  height: number = 100
): React.ReactNode[] {
  const result: React.ReactNode[] = []
  posts.forEach((post, i) => {
    result.push(post)
    if ((i + 1) % every === 0 && i < posts.length - 1) {
      result.push(
        <div key={`ad-${i}`} className="col-span-full">
          <AdBanner location={location} height={height} />
        </div>
      )
    }
  })
  return result
}
