'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Category {
  slug: string
  name: string
  color?: string
  image?: string
}

export default function CategoriesCarousel({ categories }: { categories: Category[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categories])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }

  const doubledCategories = [...categories, ...categories]

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-8 overflow-x-auto pb-5 pt-2.5 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {doubledCategories.map((cat, idx) => (
          <Link
            key={`${cat.slug}-${idx}`}
            href={`/categorias?cat=${cat.slug}`}
            className="flex flex-col items-center gap-2.5 min-w-[160px] snap-start group"
          >
            <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-[var(--accent)] p-[5px] bg-[var(--bg-card)] transition-all duration-400 group-hover:scale-110 group-hover:rotate-[5deg] group-hover:shadow-lg">
              <div
                className="w-full h-full rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${cat.image || '/images/blog/blog-3.jpg'})`,
                }}
              />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
              {cat.name}
            </h3>
          </Link>
        ))}
      </div>

      {/* Navigation Buttons */}
      {categories.length > 2 && (
        <>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed z-10"
            aria-label="Anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed z-10"
            aria-label="Próximo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
