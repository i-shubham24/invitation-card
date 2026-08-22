import { useEffect, useRef, useState } from 'react'

/**
 * Reveal — pops its child into view on scroll. Animates transform + opacity
 * only, and stops observing after firing. `variant`: up | zoom | left | right.
 */
export default function Reveal({ children, variant = 'up', className = '', style }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), io.unobserve(el)),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`rv rv--${variant} ${shown ? 'is-in' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
